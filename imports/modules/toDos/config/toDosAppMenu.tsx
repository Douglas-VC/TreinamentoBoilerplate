import React from 'react';
import Class from '@mui/icons-material/Class';
import { IAppMenu } from '/imports/modules/modulesTypings';

export const toDosMenuItemList: (IAppMenu | null)[] = [
    {
        path: '/toDos',
        name: 'Tarefas',
        icon: <Class />,
    },
];
