var _ = require('lodash');

module.exports = function(User) {
    User.getList = function(userId, callback) {
        var UserMapping = User.app.models.userMapping;
        if (!userId) {
            return callback({ name: "User id not found", message: "please specify userId", status: 400 })
        }
        User.find({},
            function(err, users) {
                if (users && users.length > 0) {
                    _.remove(users, function(user) {
                        return user.id == userId;
                    });
                    UserMapping.find({
                        where: {
                            or: [
                                { sender: userId },
                                { receiver: userId }
                            ]
                        }
                    }, function(err, userMappingResponse) {
                        if (userMappingResponse && userMappingResponse.length > 0) {
                            for (var i = 0; i < users.length; i++) {
                                var receivers = _.map(userMappingResponse,
                                    function(userMapping) {
                                        if (userMapping.receiver == users[i].id) {
                                            users[i].status = userMapping.status;
                                            users[i].userMappingId = userMapping.id;
                                            users[i].sender = false;
                                        } else if (userMapping.sender == users[i].id) {
                                            users[i].userMappingId = userMapping.id;
                                            users[i].status = userMapping.status;
                                            users[i].sender = true;
                                        }
                                        return;
                                    });
                            }
                        }
                        var response = users;
                        callback(null, response);
                    });
                } else {
                    return callback({ name: "Users not found", message: "No user has been registered", status: 400 })
                }
            });
    };

    User.remoteMethod(
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
};
