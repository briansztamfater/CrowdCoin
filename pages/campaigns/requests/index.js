import React, { Component } from 'react';
import { Button, Dimmer, Form, Grid, Loader, Message, Table } from 'semantic-ui-react';

import Layout from '../../../components/Layout';
import RequestRow from '../../../components/RequestRow';
import { Link } from '../../../routes';
import Campaign from '../../../ethereum/campaign';

class RequestIndex extends Component {
  state = {
    isLoading: false,
    errorMessage: ''
  };

  static async getInitialProps(props) {
    const { address } = props.query;
    const campaign = Campaign(address);
    const requestCount = await campaign.methods.getRequestCount().call();
    const approversCount = await campaign.methods.approversCount().call();

    const requests = await Promise.all(
      Array(parseInt(requestCount))
        .fill()
        .map((element, index) => {
          return campaign.methods.requests(index).call();
        })
    );

    return { address, requests, requestCount, approversCount };
  }

  renderRows() {
    return this.props.requests.map((request, index) => {
      return (
        <RequestRow
          key={index}
          id={index}
          request={request}
          address={this.props.address}
          approversCount={this.props.approversCount}
          onTransactionStart={() => this.setState({ isLoading: true, errorMessage: '' })}
          onTransactionFinish={() => this.setState({ isLoading: false })}
          onTransactionError={errorMessage => this.setState({ errorMessage })}
        />
      );
    });
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;

    return (
      <Layout>
        <Grid>
          <Grid.Row style={{ paddingBottom: 0 }}>
            <Grid.Column width={10}>
              <h3>Requests</h3>
            </Grid.Column>
            <Grid.Column width={6}>
              <Link route={`/campaigns/${this.props.address}/requests/new`}>
                <a>
                  <Button primary floated="right" style={{ marginBottom: 10 }}>Add Request</Button>
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row style={{ paddingTop: 0 }}>
            <Grid.Column>
              <Form error={!!this.state.errorMessage}>
                <Message
                  error
                  header="Oops!"
                  content={this.state.errorMessage}
                />
                <Dimmer.Dimmable dimmed={this.state.isLoading}>
                  <Dimmer active={this.state.isLoading} inverted>
                    <Loader active={this.state.isLoading} />
                  </Dimmer>
                  <Table>
                    <Header>
                      <Row>
                        <HeaderCell>ID</HeaderCell>
                        <HeaderCell>Description</HeaderCell>
                        <HeaderCell>Amount</HeaderCell>
                        <HeaderCell>Recipient</HeaderCell>
                        <HeaderCell>Approval Count</HeaderCell>
                        <HeaderCell>Approve</HeaderCell>
                        <HeaderCell>Finalize</HeaderCell>
                      </Row>
                    </Header>
                    <Body>
                      {this.renderRows()}
                    </Body>
                  </Table>
                </Dimmer.Dimmable>
                <div style={{ marginTop: 10 }}>
                  Found {this.props.requestCount}
                </div>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default RequestIndex;