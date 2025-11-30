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

export class backendEdit extends React.Component {
	render() {
		return (
			<Edit {...this.props}>
				<SimpleForm toolbar={<Toolbar alwaysEnableSaveButton />}>
				<TextField source="id" />
				<TextInput source="name" />
				<TextInput source="description" />
				<ImageField source="photo" title="photo" sortable={false}/>
				<TextField source="lon" />
				<TextField source="lat" />
				<TextField source="time" />
				<BooleanInput label="invalid" source="invalid" />
				<BooleanInput label="upload" source="upload" />
				</SimpleForm>
			</Edit>
		);
	}
};
