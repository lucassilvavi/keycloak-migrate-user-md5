import React, { Component } from 'react';
import axios from "axios";


class Secured extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            token: '',
        };
        this.user = {}
    }


    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    getToken = async () =>{
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        };

        const data = new URLSearchParams({
            'client_id': 'GG',
            'client_secret': '27d84f40-6236-4eaa-9dcb-d2de3dd35d06',
            'grant_type': 'client_credentials',
        });

        axios.post('http://localhost:8085/auth/realms/master/protocol/openid-connect/token',
            data,
            {headers}).then((response)=>{
            this.state.token = response.data.access_token;
            (async () => {
                await this.getUser();
            })();
        })
    }

    getUser = async () =>{
        const headers = {
            "Authorization": `Bearer ${this.state.token}`,
        };

        axios.get( `http://localhost:8085/auth/admin/realms/master/users?search=${this.state.email}`,
            {headers}).then((response)=>{
            this.user = response.data;
            (async () => {
                await this.updatePassword();
            })();
        })
    }

    updatePassword = async () => {
       const md5 = require('md5');

        if (this.user[0].attributes.legado[0] !== md5(this.state.password)){
            alert('Password diferente!');
            return;
        }


        const headers = {
            "Authorization": `Bearer ${this.state.token}`,
        };

        const data = {
            "type"         : "password",
            "temporary"   : false,
            "value"       : this.state.password
        }

        axios.put( `http://localhost:8085/auth/admin/realms/master/users/${this.user[0].id}/reset-password`,
            data,
            {headers}).then((response)=>{ alert('Tudo Certo no PUT') })
    }

    handleSubmit = event => {
        event.preventDefault();

        (async () => {
            await this.getToken();
        })();

    }

    render() {
        const { email, password } = this.state;
        return(
            <div>
            <form onSubmit={this.handleSubmit}>
                <label>Email</label>
                <input type={'text'}
                       name={'email'}
                       value={email}
                       onChange={this.onChange}
                />
                <label>Password</label>
                <input
                    type={'password'}
                    name={'password'}
                    value={password}
                    onChange={this.onChange}
                />
                <button type={'submit'}>Logar</button>
            </form>
        </div>
        );
    }
}

export default Secured;