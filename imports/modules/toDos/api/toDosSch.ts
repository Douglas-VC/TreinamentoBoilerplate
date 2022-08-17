import { IDoc } from '/imports/typings/IDoc';

export const toDosSch = {
    name: {
        type: String,
        label: 'Nome',
        defaultValue: '',
        optional: false,
    },
    description: {
        type: String,
        label: 'Descrição',
        defaultValue: '',
        optional: false,
    },
    status: {
        type: String,
        label: 'Situação',
        defaultValue: '',
        optional: false,
        options: ['Concluída', 'Não Concluída'],
    },
    type: {
        type: String,
        label: 'Tipo',
        defaultValue: '',
        optional: false,
        options: [
            { value: 'private', label: 'Pessoal' },
            { value: 'public', label: 'Pública' },
        ],
    },
    date: {
        type: Date,
        label: 'Data',
        defaultValue: '',
        optional: false,
    },
};

export interface IToDos extends IDoc {
    name: string;
    description: string;
    status: string;
    type: string;
    date: Date;
}
