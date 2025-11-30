import React from 'react';
import { List, Datagrid, TextField, SearchInput, ImageField, useRecordContext, ShowButton, EditButton} from 'react-admin';

import { Fragment } from 'react';

import { BulkUpdateButton, TextInput, ExportButton, TopToolbar, FilterButton } from 'react-admin';

import { downloadCSV } from 'react-admin';
import { unparse as convertToCSV } from 'papaparse/papaparse.min';
import Button from 'react-bootstrap/Button';

const exporter = data => {
	const csv = convertToCSV(data);
	const BOM = '\uFEFF'
	downloadCSV(`${BOM} ${csv}`, 'export')
}

const MyButton = (props) => {
	const record = useRecordContext();
	const handleClick = (event) => {
		event.stopPropagation();
		window.open(record.photo,'_blank') 
	}
	return (
		<Button variant="primary" onClick={handleClick}>
            Show photo
		</Button>
	);
};

const PostBulkActionButtons = (props) => (
	<Fragment>
		<BulkUpdateButton {...props}/>
        {/* <BulkDeleteButton {...props} /> */}
    </Fragment>
);
const searchFilters = [
	<SearchInput labe="Search" source="q" resettable alwaysOn />,
	<TextInput label="Invalid" source="invalid" defaultValue="false" />,
	<TextInput label="Start time" source="startTime" defaultValue="2020-01-01" />,
	<TextInput label="End time" source="endTime" defaultValue="2030-01-01" />
];

const ListActions = (props) => (
	<TopToolbar>
			<FilterButton {...props} />
			<ExportButton maxResults={30000} {...props} />
	</TopToolbar>
);

export class dataList extends React.Component {
	render() {
		return (
			<List {...this.props} actions={<ListActions />} bulkActionButtons={<PostBulkActionButtons />} filters={searchFilters} exporter={exporter}>
			<Datagrid rowClick="edit">
				<TextField source="id" order='DESC'/>
				<TextField source="name" />
				<TextField source="description" />
				<ImageField source="photo" title="photo" sortable={false}/>
				<TextField source="lon" />
				<TextField source="lat" />
				{/* <TextField source="upload" sortable={false}/> */}
				<TextField source="time"/>	
				<TextField source="invalid" sortable={false}/>	
				<MyButton record="image url" source="image url" sortable={false}/>
			</Datagrid>
		</List>
		);
	}
}
