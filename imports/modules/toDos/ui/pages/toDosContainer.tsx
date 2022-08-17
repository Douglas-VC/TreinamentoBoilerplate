import React from 'react';
import { ToDosListContainer } from './toDosList';
import { ToDosDetailContainer } from './toDosDetail';
import { IDefaultContainerProps } from '/imports/typings/BoilerplateDefaultTypings';
import { useParams } from 'react-router-dom';

export default (props: IDefaultContainerProps) => {
    const validState = ['view', 'edit', 'create'];

    let { screenState, toDosId } = useParams();

    const state = screenState ? screenState : props.screenState;

    const id = toDosId ? toDosId : props.id;

    if (!!state && validState.indexOf(state) !== -1) {
        if (state === 'view' && !!id) {
            return <ToDosDetailContainer {...props} screenState={state} id={id} />;
        } else if (state === 'edit' && !!id) {
            return (
                <ToDosDetailContainer
                    {...props}
                    screenState={state}
                    id={id}
                    {...{ edit: true }}
                />
            );
        } else if (state === 'create') {
            return (
                <ToDosDetailContainer
                    {...props}
                    screenState={state}
                    id={id}
                    {...{ create: true }}
                />
            );
        }
    } else {
        return <ToDosListContainer {...props} />;
    }
};
