import Web3 from 'web3';
import React from 'react';
import { ShowButton } from 'react-admin';
import truncateEthAddress from 'truncate-eth-address'
import { List, Datagrid, TextField, ImageField, SearchInput, TextInput, BulkUpdateButton, ExportButton, TopToolbar, FilterButton } from 'react-admin';
import { Fragment } from 'react';
import { downloadCSV } from 'react-admin';
import { unparse as convertToCSV } from 'papaparse/papaparse.min';


const exporter = data => {
	const csv = convertToCSV(data);
	const BOM = '\uFEFF'
	downloadCSV(`${BOM} ${csv}`, 'export')
};

const PostBulkActionButtons = props => (
	<Fragment>
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

export class  backendblock extends React.Component {
	render() {
		return(
			<List {...this.props} actions={<ListActions />}  bulkActionButtons={<PostBulkActionButtons />} filters={searchFilters} exporter={exporter}>
			<Datagrid rowClick="edit">
				<TextField source="id" order='DESC' />
				<TextField source="name"  />
				<TextField source="description"  />
				<ImageField source="photo" title="photo"  sortable={false} />
				<TextField source="lon"   />
				<TextField source="lat"   />
				<TextField source="time"  />
				<TextField source="invalid" sortable={false}/>	
			</Datagrid>
		</List>
		);
	}
}
