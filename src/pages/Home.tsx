import React, { Component } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonInput } from '@ionic/react';
import { Plugins } from '@capacitor/core';
import axios from 'axios';

const { Storage } = Plugins;

interface IProps { }

interface IState {
  rates?: { [key: string]: number };
  base?: string;
  date?: Date;
}


class Home extends Component<IProps, IState> {
  state: IState = {}

  componentDidMount() {
    this.fetchRates()
  }

  fetchRates = () => {
    axios.get("https://api.exchangeratesapi.io/latest")
      .then(response => {
        this.setState(response.data)
        this.setObject()
        console.log(this.state)
      })
  }

  doRefresh() {
    this.fetchRates()
  }

  async setObject() {
    await Storage.set({
      key: this.state.base as string,
      value: JSON.stringify(this.state)
    });
  }

  async keys() {
    const keys = await Storage.keys();
    console.log('Got keys: ', keys);
  }

  getObject = async () => {
    const ret = await Storage.get({key: this.state.base as string});

    if (ret.value !== null) {
      const date = JSON.parse(ret.value);
      console.log(date)
    }
  }

  render() {
    let date

    if (this.state.date !== undefined) {
      date = (
        <span>{this.state.date}</span>
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
          <p>Updated {date}</p>

          <IonInput type="number" value="1" color="primary" placeholder={this.state.base} ></IonInput>
          <IonInput type="number" value="333"></IonInput>
        </IonContent>
      </IonPage>
    )
  }
}

export default Home;
