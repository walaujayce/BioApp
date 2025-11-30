
var admin = require("firebase-admin");

var serviceAccount = require("../../config/firebase-secret/biological-324006-firebase-adminsdk-4snru-e6da79fa36.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth()

// Id comes from firebase.auth().currentUser.getIdToken()
// https://firebase.google.com/docs/auth/admin/verify-id-tokens
async function verifyId(id){
  try{
    let decodedToken = await auth.verifyIdToken(id);
    let uid = decodedToken.uid;
    let userInfo = await auth.getUser(uid);
    return userInfo.phoneNumber;
  } catch(e){
    return undefined;
  }
}
module.exports = {
  verifyId
}

