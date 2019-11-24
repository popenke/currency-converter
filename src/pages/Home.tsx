import React, { Component } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import axios from 'axios';

interface IProps { }

export interface IState {
  rates?: { [key: string]: number };
  base?: string;
  date?: Date;
}


class Home extends Component<IProps, IState> {
  state = {
    rates: undefined,
    base: undefined,
    date: undefined
  }

  componentDidMount() {
    this.fetchRates()
  }

  fetchRates = () => {
    axios.get("https://api.exchangeratesapi.io/latest")
      .then(response => {
        this.setState(response.data)
        console.log(this.state)
      })
  }

  doRefresh() {
    this.fetchRates()
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
          <p>Updated {date}</p>
        </IonContent>
      </IonPage>
    )
  }
}

export default Home;
