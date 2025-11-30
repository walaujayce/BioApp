import React from 'react';
import { Admin, Resource} from 'react-admin';
import loginProvider from './loginProvider';
import { dataList } from './post'
import dataUpload from './myDataProvider.js'
import { userList } from './userList.js'
import {dataEdit} from './edit.js'
import {userEdit} from './editUser.js'
import {backendEdit} from './editBackend.js'
import {backendblock} from './backendblock'
import polyglotI18nProvider from "ra-i18n-polyglot"; 
import engMessages from "ra-language-english"; 
import 'bootstrap/dist/css/bootstrap.min.css';

const dataProvider = dataUpload();
// const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
const i18nProvider = polyglotI18nProvider((locale) => engMessages, "en", {
    allowMissing: true,
    onMissingKey: (key, _, __) => key,
});
const App = () => (
    <div>
        <Admin dataProvider={dataProvider} authProvider={loginProvider} i18nProvider={i18nProvider}>
            {/* <Resource name="users" list={ListGuesser} /> */}
            <Resource name="uploaded_data" list={dataList} edit={ dataEdit }/>
            <Resource name="backend_data" list={backendblock} edit={backendEdit}/>
            <Resource name="user" list={userList} edit={ userEdit }/>
        </Admin>
    </div>
);

export default App;
