import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Input, CheckBox } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';

class Login extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            remember: false
        };
    }

    static navigationOptions = {
        title: 'Login'
    }

    handleLogin() {
        console.log(JSON.stringify(this.state));
        if (this.state.remember) {                              // this block is to see if the 'Remember Me' checkbox IS checked. //if so, we'll save the username & password to the SecureStore using the 'setItemAsync' method.
            SecureStore.setItemAsync('userinfo', JSON.stringify( // required for 'setItemAsync' are two arguments: (key, value)
                {username: this.state.username, password: this.state.password})) // remember, all the SecureStore methods return a 'promise' that will reject if there is an error.
                .catch(error => console.log('Could not save user info', error)); //checks for a rejected promise.
        } else {
            SecureStore.deleteItemAsync('userinfo') //if remember me is NOT checked, delete any info in the SecureStore. The method deletes any data stored under the (key: 'userinfo').
                .catch(error => console.log('Could not delete user info', error))
        }
    }

    componentDidMount() {       //insures that the userinfo is retrieved from the SecureStore when the component mounts. This Lifecycle method.
        SecureStore.getItemAsync('userinfo') //check for if there's any data saved under the key: userinfo. Returns a promise: if resolves, will return a value stored under that key.
            .then(userdata => {     //.then() method helps us access that value. Intermediary variable name: userdata.
                const userinfo = JSON.parse(userdata); //.parse() changes the userdata back to a JavaScript object, then storing inside this variable.
                if (userinfo) {     // checking to see if the userinfo variable contains a non-null truthy value. If so, update login's state:
                    this.setState({username: userinfo.username});
                    this.setState({password: userinfo.password});
                    this.setState({remember: true}) 
                }
            });
    }

    render() {
        return (
            <View style={styles.container}>
                <Input
                    placeholder='Username'
                    leftIcon={{type: 'font-awesome', name: 'user-o'}}
                    onChangeText={username => this.setState({username})} //whenever textValue for this input is changed, it'll update the username in the state, using 'setState'.
                    value={this.state.username}     //this will make it always reflect the state, making this a controlled component.
                    containerStyle={styles.formInput}
                    leftIconContainerStyle={styles.formIcon}
                />
                <Input
                    placeholder='Password'
                    leftIcon={{type: 'font-awesome', name: 'key'}}
                    onChangeText={password => this.setState({password})} //updates the state for password
                    value={this.state.password}     // the input's value is controlled by the login component's state, as well
                    containerStyle={styles.formInput}
                    leftIconContainerStyle={styles.formIcon}
                />
                <CheckBox
                    title='Remember Me'
                    center
                    checked={this.state.remember} //this is set to be controlled by the Login Component's state property of 'remember'
                    onPress={() => this.setState({remember: !this.state.remember})} //to change the 'remember' state to the opposite of whatever it currently is. If false, it'll change to true, and vice versa.
                    containerStyle={styles.formCheckbox}
                />
                <View style={styles.formButton}>
                    <Button
                        onPress={() => this.handleLogin()}
                        title='Login'
                        color='#5637DD'
                    />
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({      // requires to pass in an object that defines all the styles that we're using.
    container: {
        justifyContent: 'center',
        margin: 20
    },
    formIcon: {
        marginRight: 10
    },
    formInput: {
        padding: 10
    },
    formCheckbox: {
        margin: 10,
        backgroundColor: null
    },
    formButton: {
        margin: 40
    }
})

export default Login;

// Now this Component will need to be integrated into our Navigation in MainComponent.js