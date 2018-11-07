pragma solidity ^0.4.0;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    Request[] public requests;
    uint public approversCount;
    
    modifier restricted() {
        require(msg.sender == manager, "Sender address must be the contract manager");
        _;
    }
    
    modifier onlyApprovers() {
        require(approvers[msg.sender], "Sender address must be on the approver list");
        _;
    }
    
    constructor(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }
    
    function contribute() public payable {
        require(msg.value > minimumContribution, "Contribution must be higher than the minimum");
        
        if (!approvers[msg.sender]) {
            approvers[msg.sender] = true;
            approversCount++;
        }
    }
    
    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        
        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public onlyApprovers {
        Request storage request = requests[index];
        
        require(!request.approvals[msg.sender], "Sender address has already approved this request");
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(!request.complete, "Request is alraedy completed");
        require(request.approvalCount > (approversCount / 2), "There are no enough approvals for finalizing this request");
        
        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (
          minimumContribution,
          address(this).balance,
          requests.length,
          approversCount,
          manager
        );
    }

    function getRequestCount() public view returns (uint) {
        return requests.length;
    }
}