/**
 * forwarder-factory.js
 */
(function(angular) {
    'use strict';

    angular
        .module('port-forwarder.forwarder-factory', ['port-forwarder.ipc'])
        .factory('forwarder', ForwarderCtrl)
        .constant('forwarderChannel', {
            reload: 'FORWARDER_RELOAD',
            delete: 'FORWARDER_DELETE'
        });

    ForwarderCtrl.$inject = ['$q', 'electronIpc', 'forwarderChannel'];

    function ForwarderCtrl($q, electronIpc, forwarderChannel) {
        let list = [];
        return {
            createRule: createRule,
            deleteRule: deleteRule,
            reloadRules: reloadRules,
            getRulesArray: function() { return list; }
        };

        function createRule() {
            let rule = new ForwarderRule();
            list.push(rule);
            return rule;
        }

        function deleteRule(index) {
            let deferred = $q.defer();
            electronIpc.send(forwarderChannel.delete, list[index].in.port);
            electronIpc.once(forwarderChannel.delete, (_, success) => {
                list.splice(index, 1);
                success ? deferred.resolve() : deferred.reject();
            });
            return deferred.promise;
        }

        function reloadRules() {
            let deferred = $q.defer();
            electronIpc.send(forwarderChannel.reload, list);
            electronIpc.once(forwarderChannel.reload, (_, success) => {
                success ? deferred.resolve() : deferred.reject();
            });
            return deferred.promise;
        }
    }

    function ForwarderRule() {
        this.in  = {port: 0};
        this.out = {port: 0, address:'0.0.0.0'};
    }
})(angular);
