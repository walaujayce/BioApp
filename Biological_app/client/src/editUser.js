import * as React from "react";
import {
    Edit,
    SimpleForm,
    ReferenceInput,
	SelectInput,
	BooleanInput,
	TextInput,
	TextField,
	ImageField,
	Toolbar,
} from 'react-admin';

export class userEdit extends React.Component {
	render() {
		return (
			<Edit {...this.props}>
				<SimpleForm toolbar={<Toolbar alwaysEnableSaveButton />}>
				<TextInput source="user" sortable={false}/>
				<TextInput source="email" sortable={false}/>
				<TextInput source="name" sortable={false}/>
				<TextField source="admin" sortable={false}/>
				<TextInput source="phone" sortable={false}/>
				<TextField source="blocked_time" sortable={false}/>
				</SimpleForm>
			</Edit>
		);
	}
};
