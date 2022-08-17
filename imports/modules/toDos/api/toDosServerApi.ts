// region Imports
import { Recurso } from '../config/Recursos';
import { toDosSch, IToDos } from './toDosSch';
import { userprofileServerApi } from '/imports/userprofile/api/UserProfileServerApi';
import { ProductServerBase } from '/imports/api/productServerBase';
import { IContext } from '/imports/typings/IContext';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { getUser } from '/imports/libs/getUser';
// endregion

class ToDosServerApi extends ProductServerBase<IToDos> {
    constructor() {
        super('toDos', toDosSch, {
            resources: Recurso,
        });

        this.addTransformedPublication(
            'toDosList',
            (filter = {}) => {
                return this.defaultListCollectionPublication({...filter, "$or": [{ type: 'public' }, { createdby: getUser()._id }]}, {
                    projection: { name: 1, description: 1, status: 1, type: 1, date: 1, createdby: 1, lastupdate: 1, createdat: 1 },
                });
            },
            (doc: IToDos & { userName: string }) => {
                const userProfileDoc = userprofileServerApi
                    .getCollectionInstance()
                    .findOne({ _id: doc.createdby });
                return { ...doc, userName: userProfileDoc?.username };
            }
        );

        this.addPublication('toDosDetail', (filter = {}) => {
            return this.defaultDetailCollectionPublication(filter, {});
        });

        this.registerMethod(
            'changeStatus',
            function serverChangeStatus(id: string, newStatus: string, context: IContext) {
                if (Meteor.isServer) {
                    check(id, String);
                    check(newStatus, String);
                    const {user} = context;
                    const doc = toDosServerApi.getCollectionInstance().findOne({_id:id});
                    doc.status = newStatus;
                    return toDosServerApi.serverUpdate(doc,context);
                }
            }
        );
    }
}

export const toDosServerApi = new ToDosServerApi();
