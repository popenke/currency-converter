import React, { Component } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonInput, IonGrid, IonRow, IonCol, IonModal, IonIcon, IonList, IonItem, IonLabel } from '@ionic/react';
import { Plugins } from '@capacitor/core';
import { Currency } from '../models/Currency';
import axios from 'axios';

const { Storage } = Plugins;

interface IProps { }

interface IState {
  baseCurrency?: Currency,
  baseAmount: number,
  foreignCurrency: string,
  foreignAmount: number
  showModal: boolean
}

class Home extends Component<IProps, IState> {

  state: IState = {
    baseAmount: 1,
    foreignCurrency: 'USD',
    foreignAmount: 0,
    showModal: false
  }

  componentDidMount() {
    this.fetchRates()
  }

  //#region Service
  fetchRates = () => {
    axios.get("https://api.exchangeratesapi.io/latest")
      .then(response => {
        this.setState({
          baseCurrency: response.data
        })
        this.evaluateRates(this.state.baseAmount.toString())
        this.clear()
      })
  }

  fetchAll = () => {
    for (let currency in (this.state.baseCurrency as Currency).rates) {
      axios.get("https://api.exchangeratesapi.io/latest?base=" + currency)
        .then(response => {
          this.setState({
            baseCurrency: response.data
          })
          this.setObject()
          console.log(this.state)
        })
    }
  }

  doRefresh() {
    this.fetchRates()
  }
  //#endregion

  //#region Storage
  async setObject() {
    if (this.state.baseCurrency) {
      await Storage.set({
        key: this.state.baseCurrency.base as string,
        value: JSON.stringify(this.state.baseCurrency)
      });
    }
  }

  async keys() {
    const keys = await Storage.keys();
    console.log('Got keys: ', keys);
  }

  async clear() {
    await Storage.clear();
  }

  getObject = async () => {
    const ret = await Storage.get({ key: 'BRL' });

    if (ret.value !== null) {
      const val = JSON.parse(ret.value);
      this.setState(val)
      console.log(val)
    }
  }
  //#endregion

  evaluateRates(amount: string) {
    const amountAsNumber = amount as unknown as number
    const baseCurrency = this.state.baseCurrency

    if (baseCurrency && baseCurrency.rates) {
      const foreignCurrencyRate = baseCurrency.rates[this.state.foreignCurrency]
      console.log(amountAsNumber * foreignCurrencyRate)
      const result = amountAsNumber * foreignCurrencyRate
      this.setState({
        baseAmount: amountAsNumber,
        foreignAmount: result
      })
    }
  }

  render() {
    let date
    let base

    if (this.state.baseCurrency) {
      date = (
        <span>{this.state.baseCurrency.date}</span>
      )
    }

    if (this.state.baseCurrency) {
      base = (
        <span>{this.state.baseCurrency.base}</span>
      )
    }

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Currency Converter</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonButton onClick={this.fetchRates}>Refresh</IonButton>
          <IonButton onClick={this.getObject}>Get data from Storage</IonButton>
          <IonButton onClick={this.keys}>Get keys from Storage</IonButton>
          <IonButton onClick={this.fetchAll}>Fetch and save rates</IonButton>
          <p>Updated {date}. Base: {base}</p>


          <IonGrid>
            <IonRow>
              <IonCol>
                <IonInput type="number" value={this.state.baseAmount.toString()} color="primary" placeholder={this.state.baseCurrency ? this.state.baseCurrency.base : "NONE"} onIonChange={(e) => this.evaluateRates((e.target as HTMLInputElement).value)}></IonInput>
              </IonCol>
              <IonCol>
                <IonModal isOpen={this.state.showModal}>
                  <IonContent>
                    <IonList>
                      <IonItem onClick={() => this.getObject} button>
                        <IonLabel>BRL</IonLabel>
                      </IonItem>
                    </IonList>
                  </IonContent>
                  <IonButton onClick={() => this.setState({ showModal: false })}  >Close Modal</IonButton>
                </IonModal>
                <IonButton onClick={() => this.setState({ showModal: true })} expand="block">
                  {this.state.baseCurrency ? this.state.baseCurrency.base : "NONE"}
                  <IonIcon slot="end" name="arrow-dropdown" />
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonInput type="number" value={this.state.foreignAmount.toString()} placeholder={this.state.foreignCurrency}></IonInput>
              </IonCol>
              <IonCol>
                <IonButton onClick={() => this.setState({ showModal: true })} expand="block">
                  {this.state.foreignCurrency}
                  <IonIcon slot="end" name="arrow-dropdown" />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    )
  }
}

export default Home;
