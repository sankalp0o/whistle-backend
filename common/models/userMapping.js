var _ = require('lodash');

module.exports = function(UserMapping) {


    UserMapping.getNotification = function(userId, callback) {
        var user = UserMapping.app.models.user;
        if (!userId) {
            return callback({ name: "User id not found", message: "please specify userId", status: 400 })
        }
        UserMapping.find({
                where: {
                    receiver: userId,
                    status: "initiated"
                }
            },
            function(err, userMappingResponse) {
                var senderIds = [];
                if (userMappingResponse && userMappingResponse.length > 0) {
                    for (var i = userMappingResponse.length - 1; i >= 0; i--) {
                        senderIds.push(userMappingResponse[i].sender);
                    }
                    user.find({
                        where: {
                            id: { inq: senderIds }
                        }
                    }, function(err, pendingUsers) {
                        console.log("pending users", pendingUsers);
                        var response;

                        function mergeByProperty(pendingUsers, userMappingResponse) {
                            _.each(pendingUsers, function(pendingUsersobj) {
                                var userMappingResponseobj = _.filter(userMappingResponse, function(userMappingResponseobj) {
                                    if (userMappingResponseobj) {
                                        pendingUsersobj.status = userMappingResponseobj.status
                                        pendingUsersobj.userMappingId = userMappingResponseobj.id
                                    }
                                    return userMappingResponseobj.receiver === pendingUsersobj.id;
                                });
                            });
                        }
                        mergeByProperty(pendingUsers, userMappingResponse);
                        callback(null, pendingUsers);
                    });
                } else {
                    return callback(null, "You have no pending requests")
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


    UserMapping.getRelation = function(userMappingId, userId, callback) {
        var user = UserMapping.app.models.user;
        if (!userId) {
            return callback({ name: "User id not found", message: "please specify userId", status: 400 })
        }
        if (!userMappingId) {
            return callback({ name: "User mapping id not found", message: "please specify userMappingId", status: 400 })
        }
        UserMapping.find({
                where: {
                    id: userMappingId
                }
            },
            function(err, userMappingResponse) {
                if (userMappingResponse && userMappingResponse.length > 0) {
                    user.find({
                        where: {
                            id: userId
                        }
                    }, function(err, pendingUsers) {
                        if (pendingUsers && pendingUsers.length > 0) {
                            var response;
                            pendingUsers[0].status = userMappingResponse[0].status;
                            pendingUsers[0].userMappingId = userMappingResponse[0].id;
                            callback(null, pendingUsers);
                        } else {
                            return callback({ name: "User is not defined", message: "There is no user specified for this id", status: 400 })
                        }
                    });
                } else {
                    return callback({ name: "User mapping not defined", message: "There is no user mapping specified for this userMappingId", status: 400 })
                }

            });
    };

    UserMapping.remoteMethod(
        'getRelation', {
            http: { path: '/getRelation', verb: 'get' },
            accepts: [{
                arg: 'userMappingId',
                type: 'string'
            }, {
                arg: 'userId',
                type: 'string'
            }],
            returns: { arg: 'getRelation', type: 'string' }
        }
    );

};
