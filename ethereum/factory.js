import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0xA4c3C3edF807Bc61c60C14c07F44c14472AB488C'
);

export default instance;