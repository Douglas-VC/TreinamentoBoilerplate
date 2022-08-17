import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { toDosApi } from '../../api/toDosApi';
import SimpleForm from '../../../../ui/components/SimpleForm/SimpleForm';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import TextField from '/imports/ui/components/SimpleFormFields/TextField/TextField';
import SelectField from '../../../../ui/components/SimpleFormFields/SelectField/SelectField';
import { PageLayout } from '/imports/ui/layouts/pageLayout';
import { IToDos } from '../../api/toDosSch';
import {
    IDefaultContainerProps,
    IDefaultDetailProps,
    IMeteorError,
} from '/imports/typings/BoilerplateDefaultTypings';
import { showLoading } from '/imports/ui/components/Loading/Loading';
import DatePickerField from '/imports/ui/components/SimpleFormFields/DatePickerField/DatePickerField';
import { getUser } from '/imports/libs/getUser';

interface IToDosDetail extends IDefaultDetailProps {
    toDosDoc: IToDos;
    save: (doc: IToDos, _callback?: any) => void;
}

const ToDosDetail = (props: IToDosDetail) => {
    const { isPrintView, screenState, loading, toDosDoc, save, navigate, ...closeComponent } = props;

    const handleSubmit = (doc: IToDos) => {
        save(doc);
    };

    return (
        <PageLayout
            closeComponent={closeComponent.closeComponent}
            key={'ExemplePageLayoutDetailKEY'}
            title={
                screenState === 'view'
                    ? 'Visualizar Tarefa'
                    : screenState === 'edit'
                    ? 'Editar Tarefa'
                    : 'Criar Tarefa'
            }
            onBack={() => navigate('/toDos')}
        >
            <SimpleForm
                key={'ExempleDetail-SimpleFormKEY'}
                mode={screenState}
                schema={toDosApi.getSchema()}
                doc={toDosDoc}
                onSubmit={handleSubmit}
                loading={loading}
            >

                <FormGroup key={'fieldsOne'}>
                    <TextField key={'f1-nameKEY'} multiline maxRows={3} placeholder="Nome" name="name" />
                    <TextField key={'f1-descriptionKEY'} multiline maxRows={3} placeholder="Descrição" name="description" />
                </FormGroup>

                <FormGroup key={'fieldsTwo'}>
                    <DatePickerField key={'f2-dateKEY'} placeholder="Data" name="date" />
                </FormGroup>

                <FormGroup key={'fieldsThree'}>
                    <SelectField key={'f3-typeKEY'} placeholder="Tipo" name="type" />
                </FormGroup>

                <div
                    key={'Buttons'}
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        paddingTop: 20,
                        paddingBottom: 20,
                    }}
                >
                    {!isPrintView ? (
                        <Button
                            key={'b1'}
                            style={{ marginRight: 10 }}
                            onClick={
                                screenState === 'edit'
                                    ? () => navigate(`/toDos/view/${toDosDoc._id}`)
                                    : closeComponent.closeComponent ? () => closeComponent.closeComponent() : () => navigate(`/toDos/list`)
                            }
                            color={'primary'}
                            variant="contained"
                        >
                            {screenState === 'view' ? 'Voltar' : 'Cancelar'}
                        </Button>
                    ) : null}

                    {!isPrintView && screenState === 'view' ? (
                        <Button
                            disabled={toDosDoc.createdby === getUser()._id ? false : true}
                            key={'b2'}
                            onClick={() => {
                                navigate(`/toDos/edit/${toDosDoc._id}`);
                            }}
                            color={'primary'}
                            variant="contained"
                        >
                            {'Editar'}
                        </Button>
                    ) : null}
                    {!isPrintView && screenState !== 'view' ? (
                        <Button
                            key={'b3'}
                            color={'primary'}
                            variant="contained"
                            {...{ submit: 'true' }}
                        >
                            {'Salvar'}
                        </Button>
                    ) : null}
                </div>
            </SimpleForm>
        </PageLayout>
    );
};

interface IToDosDetailContainer extends IDefaultContainerProps {}

export const ToDosDetailContainer = withTracker((props: IToDosDetailContainer) => {
    const { screenState, id, navigate, showNotification } = props;

    const subHandle = !!id ? toDosApi.subscribe('toDosDetail', { _id: id }) : null;
    let toDosDoc = id && subHandle?.ready() ? toDosApi.findOne({ _id: id }) : {};

    return {
        screenState,
        toDosDoc,
        save: (doc: IToDos, _callback: () => void) => {
            const selectedAction = screenState === 'create' ? 'insert' : 'update';
            if  (selectedAction === 'insert') doc.status = 'Não Concluída'
            toDosApi[selectedAction](doc, (e: IMeteorError, r: string) => {
                if (!e) {
                    navigate(`/toDos`);
                    showNotification &&
                        showNotification({
                            type: 'success',
                            title: 'Operação realizada!',
                            description: `A Tarefa foi ${
                                doc._id ? 'atualizada' : 'cadastrada'
                            } com sucesso!`,
                        });
                } else {
                    console.log('Error:', e);
                    showNotification &&
                        showNotification({
                            type: 'warning',
                            title: 'Operação não realizada!',
                            description: `Erro ao realizar a operação: ${e.reason}`,
                        });
                }
            });
        },
    };
})(showLoading(ToDosDetail));
