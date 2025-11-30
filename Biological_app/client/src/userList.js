import React from 'react';
import { List, Datagrid, TextField, SearchInput, TextInput} from 'react-admin';
import { Fragment } from 'react';

import { downloadCSV } from 'react-admin';
import { unparse as convertToCSV } from 'papaparse/papaparse.min';

const exporter = data => {
    const csv = convertToCSV({data});
    const BOM = '\uFEFF';
    downloadCSV(`${BOM} ${csv}`, 'export');
};

const searchFilters = [
	<SearchInput labe="Search" source="q" resettable alwaysOn />,
	<TextInput label="Invalid" source="invalid" defaultValue="false" />,
];

const PostBulkActionButtons = props => (
	<Fragment>
    </Fragment>
);
export class userList extends React.Component {
	render() {
		return(
		<List {...this.props} bulkActionButtons={<PostBulkActionButtons />} exporter={exporter} filters={searchFilters} >
			<Datagrid rowClick="edit">
				<TextField source="user" sortable={false}/>
				<TextField source="email" sortable={false}/>
				<TextField source="name" sortable={false}/>
				<TextField source="admin" sortable={false}/>
				<TextField source="phone" sortable={false}/>
				<TextField source="blocked_time" sortable={false}/>
			</Datagrid>
		</List>
		);
	}
}
