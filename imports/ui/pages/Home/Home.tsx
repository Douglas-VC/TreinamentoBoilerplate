import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { toDosApi } from '/imports/modules/toDos/api/toDosApi';
import _ from 'lodash';
import { ReactiveVar } from 'meteor/reactive-var';
import { initSearch } from '/imports/libs/searchUtils';
import shortid from 'shortid';
import { PageLayout } from '/imports/ui/layouts/pageLayout';
import {
    IDefaultContainerProps,
    IDefaultListProps,
    IMeteorError,
} from '/imports/typings/BoilerplateDefaultTypings';
import { IToDos } from '/imports/modules/toDos/api/toDosSch';
import { IConfigList } from '/imports/typings/IFilterProperties';
import { showLoading } from '/imports/ui/components/Loading/Loading';
import { Button, List, Typography } from '@mui/material';
import { Task } from '/imports/modules/toDos/ui/pages/components/Task';
import { getUser } from '/imports/libs/getUser';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

interface IHome extends IDefaultListProps {
    remove: (doc: IToDos) => void;
    changeStatus: (id: string, newStatus: string) => void;
    viewComplexTable: boolean;
    setViewComplexTable: (_enable: boolean) => void;
    toDoss: IToDos[];
    setFilter: (newFilter: Object) => void;
    clearFilter: () => void;
}

const Home = (props: IHome) => {
    const {
        toDoss,
        navigate,
        remove,
        showDeleteDialog,
        showModal,
        changeStatus,
        showNotification
    } = props;

    const showModalPage = (task: IToDos) => {
        showModal && showModal({ title: 'Visualizar Tarefa', url: `/toDos/view/${task._id}`, modalOnClose: true });
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

            <Typography
                variant='h1'
            >
                {'Olá, ' + getUser().username}
            </Typography>

            <Typography
                variant='h3'
                sx={{ ml: '40px', mt: '20px', mb: '10px' }}
            >
                {'Atividades Recentes'}
            </Typography>

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
                <Button
                    onClick={() => navigate('/toDos/list')}
                    color={'primary'}
                    variant="contained"
                    sx={{
                        width: '240px',
                        height: '45px',
                        borderRadius: '25px'
                    }}
                >
                    <Typography
                        variant='subtitle1'
                        noWrap
                        sx={{ color: '#FFF' }}
                    >
                        {'Minhas Tarefas'}
                    </Typography>
                    <DoubleArrowIcon sx={{ transform: "scale(1.2)", color: '#FFF', ml: 1 }} />
                </Button>
            </div>
        </PageLayout>
    );
};

export const subscribeConfig = new ReactiveVar<IConfigList>({
    pageProperties: {
        currentPage: 1,
        pageSize: 5,
    },
    sortProperties: { field: 'lastupdate', sortAscending: false },
    filter: {},
    searchBy: null
});

const toDosSearch = initSearch(
    toDosApi, // API
    subscribeConfig, // ReactiveVar subscribe configurations
    ['name', 'description'] // list of fields
);

let onSearchToDosTyping: any;

export const HomeContainer = withTracker((props: IDefaultContainerProps) => {
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
    const toDoss = subHandle?.ready() ? toDosApi.find(filter, { sort, limit }).fetch() : [];

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
    };
})(showLoading(Home));
