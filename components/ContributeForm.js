import React, { Component } from 'react';
import { Form, Input, Button, Message } from 'semantic-ui-react';

import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

class ContributeForm extends Component {
  state = {
    contribution: '',
    isLoading: false,
    errorMessage: ''
  }

  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ isLoading: true, errorMessage: '' });

    const { address } = this.props;
    const campaign = Campaign(address);

    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.contribution, 'ether')
      });

      Router.replaceRoute(`/campaigns/${address}`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ isLoading: false, contribution: '' });
  };

  render() {
    return (
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Amount to Contribute</label>
          <Input
            label="ether"
            labelPosition="right"
            value={this.state.contribution}
            onChange={event => this.setState({ contribution: event.target.value })}
          />
        </Form.Field>
        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button primary loading={this.state.isLoading}>
          Contribute!
        </Button>
      </Form>
    );
  }
}

export default ContributeForm;