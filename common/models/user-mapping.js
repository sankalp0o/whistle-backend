var _ = require('lodash');

module.exports = function(UserMapping) {
    UserMapping.getList = function(userId, callback) {

        var response = "new list";

        callback(null, response);
    };

    UserMapping.remoteMethod(
        'getList', {
            http: { path: '/getList', verb: 'get' },
            accepts: [{
                arg: 'userId',
                type: 'string'
            }],
            returns: {
                arg: 'data',
                type: 'object'
            },
        }
    );


    UserMapping.getNotification = function(userId, callback) {
        var user = UserMapping.app.models.user;
        console.log(userId);
        UserMapping.find({
                where: {
                    receiver: userId
                }
            },
            function(err, userMappingResponse) {
                // console.log("userMappingResponse------", userMappingResponse.sender);
                var senderIds = [];
                if (userMappingResponse) {
                    for (var i = userMappingResponse.length - 1; i >= 0; i--) {
                        senderIds.push(userMappingResponse[i].sender);
                    }
                    console.log("senderIds----------", senderIds);
                    user.find({
                        where: {
                            id: { inq: senderIds }
                            // id: senderIds[0]
                        }
                    }, function(err, pendingUsers) {
                        console.log("pending users", pendingUsers);
                        var response;

                        // function customizer(objValue, srcValue) {
                        //     if (objValue.id === srcValue.receiver) {
                        //         srcValue.name = objValue.name
                        //         return srcValue;
                        //     }
                        // }
                        // var response = _.mergeWith(pendingUsers, userMappingResponse, customizer);;
                        function mergeByProperty(pendingUsers, userMappingResponse) {
                            _.each(pendingUsers, function(pendingUsersobj) {
                                var userMappingResponseobj = _.filter(userMappingResponse, function(userMappingResponseobj) {
                                    // console.log("----------", userMappingResponseobj, pendingUsersobj);
                                    if (userMappingResponseobj) {
                                        pendingUsersobj.status = userMappingResponseobj.status
                                    }
                                    return userMappingResponseobj.receiver === pendingUsersobj.id;

                                });
                                // console.log("userMappingResponseobj----------",userMappingResponseobj);
                                // console.log("pendingUsersobj----------",pendingUsersobj);
                                //If the object already exist extend it with the new values from userMappingResponse, otherwise just add the new object to pendingUsers
                                // _.assignIn(pendingUsersobj, userMappingResponseobj.status);
                            });
                        }

                        mergeByProperty(pendingUsers, userMappingResponse);

                        console.log("response ---------", pendingUsers);
                        callback(null, pendingUsers);
                    });

                } else {
                    callback(null, "no data");
                }
            });
    };
    UserMapping.remoteMethod(
        'getNotification', {
            http: { path: '/getNotification', verb: 'get' },
            accepts: [{
                arg: 'userId',
                type: 'string'
            }],
            returns: {
                arg: 'data',
                type: 'object'
            }
        }
    );


    UserMapping.getRelation = function(callback) {

        var response = "new relation";

        callback(null, response);
    };
    UserMapping.remoteMethod(
        'getRelation', {
            http: { path: '/getRelation', verb: 'get' },
            returns: { arg: 'getRelation', type: 'string' }
        }
    );

};
