import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { toDosApi } from '../../api/toDosApi';
import _ from 'lodash';
import Add from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import Pagination from '@mui/material/Pagination';
import { ReactiveVar } from 'meteor/reactive-var';
import { initSearch } from '/imports/libs/searchUtils';
import shortid from 'shortid';
import { PageLayout } from '/imports/ui/layouts/pageLayout';
import TextField from '/imports/ui/components/SimpleFormFields/TextField/TextField';
import {
    IDefaultContainerProps,
    IDefaultListProps,
    IMeteorError,
} from '/imports/typings/BoilerplateDefaultTypings';
import { IToDos } from '../../api/toDosSch';
import { IConfigList } from '/imports/typings/IFilterProperties';
import { Recurso } from '../../config/Recursos';
import { RenderComPermissao } from '/imports/seguranca/ui/components/RenderComPermisao';
import { isMobile } from '/imports/libs/deviceVerify';
import { showLoading } from '/imports/ui/components/Loading/Loading';
import { Button, Checkbox, FormControlLabel, List, useMediaQuery } from '@mui/material';
import { Task } from './components/Task';
import { getUser } from '/imports/libs/getUser';

interface IToDosList extends IDefaultListProps {
    remove: (doc: IToDos) => void;
    changeStatus: (id: string, newStatus: string) => void;
    viewComplexTable: boolean;
    setViewComplexTable: (_enable: boolean) => void;
    toDoss: IToDos[];
    setFilter: (newFilter: Object) => void;
    clearFilter: () => void;
}

const ToDosList = (props: IToDosList) => {
    const {
        toDoss,
        navigate,
        remove,
        showDeleteDialog,
        onSearch,
        total,
        loading,
        setFilter,
        clearFilter,
        setPage,
        searchBy,
        pageProperties,
        isMobile,
        showModal,
        changeStatus,
        showNotification
    } = props;

    const idToDos = shortid.generate();
    const isSmall = useMediaQuery('(max-width:600px)');
    const [text, setText] = React.useState(searchBy || '');
    const [checkbox, setCheckBox] = React.useState(true);

    const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    const showModalPage = (task: IToDos) => {
        showModal && showModal({ title: 'Visualizar Tarefa', url: `/toDos/view/${task._id}`, modalOnClose: true });
    };

    const change = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearFilter();
        if (text.length !== 0 && e.target.value.length === 0) {
            onSearch();
        }
        setText(e.target.value);
    };

    const keyPress = (_e: React.SyntheticEvent) => {
        // if (e.key === 'Enter') {
        if (text && text.trim().length > 0) {
            onSearch(text.trim());
        } else {
            onSearch();
        }
        // }
    };

    const click = (_e: any) => {
        if (text && text.trim().length > 0) {
            onSearch(text.trim());
        } else {
            onSearch();
        }
    };

    const handleCheckbox = () => {
        if (checkbox) {
            setFilter({ status: 'Não Concluída' })
            setCheckBox(false)
            setPage(1)
        } else {
            setFilter({ status: { $exists: true } })
            setCheckBox(true)
            setPage(1)
        }
    };

    const editTask = (task: IToDos) => {
        navigate('/toDos/view/' + task._id);
    }

    const callRemove = (doc: IToDos) => {
        const title = 'Remover tarefa';
        const message = `Deseja remover a tarefa "${doc.name}"?`;
        showDeleteDialog && showDeleteDialog(title, message, doc, remove);
    };

    const checkUserPermission = (id: string, action: string) => {
        if (id === getUser()._id)
            return true;
        else {
            switch (action) {
                case 'Edit':
                    showNotification &&
                        showNotification({
                            type: 'warning',
                            title: 'Operação não realizada!',
                            message: `Apenas quem criou a tarefa pode edita-la.`,
                        });
                    return false;
                case 'Remove':
                    showNotification &&
                        showNotification({
                            type: 'warning',
                            title: 'Operação não realizada!',
                            message: `Apenas quem criou a tarefa pode removê-la.`,
                        });
                    return false;
                default:
                    return false;
            }
        }
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <PageLayout title={'Lista de Tarefas'} actions={[]}>
            <TextField
                name={'pesquisar'}
                label={'Pesquisar'}
                value={text}
                onChange={change}
                onKeyPress={keyPress}
                placeholder="Digite aqui o que deseja pesquisa..."
                action={{ icon: 'search', onClick: click }}
            />

            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
            >
                <FormControlLabel
                    align='right'
                    label="Mostrar Tarefas Concluídas"
                    labelPlacement="start"
                    sx={{ mt: 1, pointerEvents: 'none' }}
                    control={
                        <Checkbox
                            defaultChecked
                            sx={{ pointerEvents: 'auto' }}
                            onChange={handleCheckbox}
                        />
                    }
                />
            </div>

            <List>
                {toDoss.map(task => (
                    <Task
                        key={task._id}
                        task={task}
                        onDeleteClick={() => checkUserPermission(task.createdby, 'Remove') ? callRemove(task) : null}
                        onEditClick={() => checkUserPermission(task.createdby, 'Edit') ? editTask(task) : null}
                        onTaskClick={() => showModalPage(task)}
                        onChangeStatus={changeStatus}
                    />
                ))}
            </List>

            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
            >
                <Pagination
                    sx={{ mt: 1 }}
                    shape="rounded"
                    variant="outlined"
                    showFirstButton
                    showLastButton
                    count={total || 0}
                    page={pageProperties.currentPage}
                    onChange={handleChangePage}
                    boundaryCount={2}
                />
            </div>

            <RenderComPermissao recursos={[Recurso.EXAMPLE_CREATE]}>
                {(isSmall || isMobile) ?
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            width: '100%',
                            marginTop: '15px'

                        }}
                    >
                        <Button
                            onClick={() => navigate(`/toDos/create/${idToDos}`)}
                            color={'primary'}
                            variant="contained"
                        >
                            {'Nova Tarefa'}
                        </Button>
                    </div> :
                    <div
                        style={{
                            position: 'fixed',
                            bottom: isMobile ? 80 : 30,
                            right: 30,
                        }}
                    >
                        <Fab
                            id={'add'}
                            onClick={() => navigate(`/toDos/create/${idToDos}`)}
                            color={'primary'}
                        >
                            <Add sx={{ color: '#FFF' }} />
                        </Fab>
                    </div>
                }
            </RenderComPermissao>
        </PageLayout>
    );
};

export const subscribeConfig = new ReactiveVar<IConfigList>({
    pageProperties: {
        currentPage: 1,
        pageSize: 4,
    },
    sortProperties: { field: 'createdat', sortAscending: true },
    filter: {},
    searchBy: null
});

const toDosSearch = initSearch(
    toDosApi, // API
    subscribeConfig, // ReactiveVar subscribe configurations
    ['name', 'description'] // list of fields
);

let onSearchToDosTyping: any;

export const ToDosListContainer = withTracker((props: IDefaultContainerProps) => {
    const { showNotification } = props;

    //Reactive Search/Filter
    const config = subscribeConfig.get();
    const sort = {
        [config.sortProperties.field]: config.sortProperties.sortAscending ? 1 : -1,
    };
    toDosSearch.setActualConfig(config);

    //Subscribe parameters
    const filter = { ...config.filter };
    // const filter = filtroPag;
    const limit = config.pageProperties.pageSize;
    const skip = (config.pageProperties.currentPage - 1) * config.pageProperties.pageSize;

    //Collection Subscribe
    const subHandle = toDosApi.subscribe('toDosList', filter, {
        sort,
        limit,
        skip,
    });
    const toDoss = subHandle?.ready() ? toDosApi.find(filter, { sort, limit, skip }).fetch() : [];

    return {
        toDoss,
        loading: !!subHandle && !subHandle.ready(),
        remove: (doc: IToDos) => {
            toDosApi.remove(doc, (e: IMeteorError) => {
                if (!e) {
                    showNotification &&
                        showNotification({
                            type: 'success',
                            title: 'Operação realizada!',
                            message: `A tarefa foi removido com sucesso!`,
                        });
                } else {
                    console.log('Error:', e);
                    showNotification &&
                        showNotification({
                            type: 'warning',
                            title: 'Operação não realizada!',
                            message: `Erro ao realizar a operação: ${e.reason}`,
                        });
                }
            });
        },
        changeStatus: (id: string, newStatus: string, callback = () => { }) => {
            toDosApi.callMethod('changeStatus', id, newStatus, callback);
        },
        searchBy: config.searchBy,
        onSearch: (...params: any) => {
            onSearchToDosTyping && clearTimeout(onSearchToDosTyping);
            onSearchToDosTyping = setTimeout(() => {
                config.pageProperties.currentPage = 1;
                subscribeConfig.set(config);
                toDosSearch.onSearch(...params);
            }, 1000);
        },
        total: subHandle ? Math.ceil(subHandle.total / 4) : Math.ceil(toDoss.length / 4),
        pageProperties: config.pageProperties,
        filter,
        sort,
        setPage: (page = 1) => {
            config.pageProperties.currentPage = page;
            subscribeConfig.set(config);
        },
        setFilter: (newFilter = {}) => {
            config.filter = { ...filter, ...newFilter };
            Object.keys(config.filter).forEach((key) => {
                if (config.filter[key] === null || config.filter[key] === undefined) {
                    delete config.filter[key];
                }
            });
            subscribeConfig.set(config);
        },
        clearFilter: () => {
            config.filter = {};
            subscribeConfig.set(config);
        },
        setSort: (sort = { field: 'createdat', sortAscending: true }) => {
            config.sortProperties = sort;
            subscribeConfig.set(config);
        },
        setPageSize: (size = 4) => {
            config.pageProperties.pageSize = size;
            subscribeConfig.set(config);
        },
    };
})(showLoading(ToDosList));
