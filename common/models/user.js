var _ = require('lodash');

module.exports = function(User) {
    User.getList = function(userId, callback) {
        var UserMapping = User.app.models.userMapping;

        User.find({},
            function(err, users) {
                UserMapping.find({
                    where: {
                        or: [
                            { sender: userId },
                            { receiver: userId }
                        ]
                    }
                }, function(err, userMappingResponse) {
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
                    var response = users;
                    callback(null, response);

                });
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
