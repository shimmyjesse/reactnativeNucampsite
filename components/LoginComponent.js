import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Image, } from 'react-native';
import { Input, CheckBox, Button, Icon } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library'; //Save to Camera Roll
import { createBottomTabNavigator } from 'react-navigation';
import { baseUrl } from '../shared/baseUrl';

class LoginTab extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            remember: false
        };
    }

    static navigationOptions = {
        title: 'Login',
        tabBarIcon: ({tintColor}) => (
            <Icon 
                name='sign-in'
                type='font-awesome'
                iconStyle={{color: tintColor}}
            />
        )
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
                        icon={
                            <Icon
                                name='sign-in'
                                type='font-awesome'
                                color='#fff'
                                iconStyle={{marginRight: 10}}
                            />
                        }
                        buttonStyle={{backgroundColor: '#5637DD'}}
                    />
                </View>
                <View style={styles.formButton}>
                    <Button
                        onPress={() => this.props.navigation.navigate('Register')}
                        title='Register'
                        type='clear'
                        icon={
                            <Icon
                                name='user-plus'
                                type='font-awesome'
                                color='blue'
                                iconStyle={{marginRight: 10}}
                            />
                        }
                        titleStyle={{color: 'blue'}}
                    />
                </View>
            </View>
        );
    }
}

class RegisterTab extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            firstname: '',
            lastname: '',
            email: '',
            remember: false,
            imageUrl: baseUrl + 'images/logo.png'
        }
    }

    static navigationOptions = {
        title: 'Register',
        tabBarIcon: ({tintColor}) => (
            <Icon 
                name='user-plus'
                type='font-awesome'
                iconStyle={{color: tintColor}}
            />
        )
    }

    getImageFromCamera = async () => {      //Making this an async function in order to use 'await' inside this to handle promises.
        const cameraPermission = await Permissions.askAsync(Permissions.CAMERA);
        const cameraRollPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (cameraPermission.status === 'granted' && cameraRollPermission.status === 'granted') {   //ONLY want to use the imagePicker API, if all permissions granted.
            const capturedImage = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1]
            });
            if (!capturedImage.cancelled) {
                console.log(capturedImage);
                this.processImage(capturedImage.uri);
                //CameraRoll.saveToCameraRoll(capturedImage.uri)
                MediaLibrary.saveToLibraryAsync(capturedImage.uri)
            }
        }                                    
    }

    getImageFromGallery = async () => {
        const cameraRollPermissions = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (cameraRollPermissions.status === 'granted') {
            const capturedImage = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1]
            });
            if (!capturedImage.cancelled) {
                console.log(capturedImage);
                this.processImage(capturedImage.uri);
            }
        }
    }

    processImage = async (imgUri) => {
        const processedImage = await ImageManipulator.manipulateAsync(
            imgUri,
            [{resize: { width: 400}}],
            {format: ImageManipulator.SaveFormat.PNG}

        )
        console.log(processedImage);
        this.setState({imageUrl: processedImage.uri});
        
    }

    handleRegister() {
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

    render() {
        
        return (
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.imageContainer}>
                        <Image      //<Image> for profile photo at top of Register Tab.
                            source={{uri: this.state.imageUrl}} //starts initialized to the NuCamp logo until user adds a photo.
                            loadingIndicatorSource={require('./images/logo.png')} //in case main image lags loading, defaults to this local image file while loading.
                            style={styles.image}
                        />
                        <Button
                            title='Camera'
                            onPress={this.getImageFromCamera}
                        />
                        <Button
                            title='Gallery'
                            onPress={this.getImageFromGallery}
                        />
                    </View>
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
                    <Input
                        placeholder='First Name'
                        leftIcon={{type: 'font-awesome', name: 'user-o'}}
                        onChangeText={firstname => this.setState({firstname})} //updates the state for 'firstname'
                        value={this.state.firstname}     // the input's value is controlled by the login component's state, as well
                        containerStyle={styles.formInput}
                        leftIconContainerStyle={styles.formIcon}
                    />
                    <Input
                        placeholder='Last Name'
                        leftIcon={{type: 'font-awesome', name: 'user-o'}}
                        onChangeText={lastname => this.setState({lastname})} //updates the state for 'lastname'
                        value={this.state.lastname}     // the input's value is controlled by the login component's state, as well
                        containerStyle={styles.formInput}
                        leftIconContainerStyle={styles.formIcon}
                    />
                    <Input
                        placeholder='Email'
                        leftIcon={{type: 'font-awesome', name: 'envelope-o'}}
                        onChangeText={email => this.setState({email})} //updates the state for 'email'
                        value={this.state.email}     // the input's value is controlled by the login component's state, as well
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
                            onPress={() => this.handleRegister()}
                            title='Register'
                            icon={
                                <Icon
                                    name='user-plus'
                                    type='font-awesome'
                                    color='#fff'
                                    iconStyle={{marginRight: 10}}
                                />
                            }
                            buttonStyle={{backgroundColor: '#5637DD'}}
                        />
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const Login = createBottomTabNavigator(
    {
        Login: LoginTab,
        Register: RegisterTab
    },
    {                       //2nd tab for configuration options.
        tabBarOptions: {
            activeBackgroundColor: '#5637DD',
            inactiveBackgroundColor: '#CEC8FF',
            activeTintColor: '#fff',
            inactiveTintColor: '#808080',
            labelStyle: {fontSize: 16}
        }
    }
)

const styles = StyleSheet.create({      // requires to pass in an object that defines all the styles that we're using.
    container: {
        justifyContent: 'center',
        margin: 10
    },
    formIcon: {
        marginRight: 10
    },
    formInput: {
        padding: 8
    },
    formCheckbox: {
        margin: 8,
        backgroundColor: null
    },
    formButton: {
        margin: 20,
        marginRight: 40,
        marginLeft: 40
    },
    imageContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        margin: 10
    },
    image: {
        width: 60,
        height: 60
    }
})

export default Login;

// Now this Component will need to be integrated into our Navigation in MainComponent.js