export const baseUrl = 'http://172.17.66.161:3001/';

// if you're experiencing issues communicating with the server, perhaps due to disconnecting and reconnecting
// to your current network, or you've connected to a different network, this may cause this url to change.
// First, 
// Check you computer's current IP Address.
// i.e. type ipconfig in your bash terminal to obtain the Windows IP Configuration and
// look for the "IPv4 Address. . . . ", which, currently is 172.17.66.161. // for example //
// Second,
// Make sure your current IP Address matches the IP Address in the 'const basUrl' listed above.