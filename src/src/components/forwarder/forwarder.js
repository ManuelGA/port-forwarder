/**
 * forwarder.js
 */
(function(angular) {
    'use strict';

    angular
        .module('port-forwarder.forwarder', [
            'ngMaterial',
            'port-forwarder.forwarder-factory'])
        .component('forwarder', {
            controller: ForwarderCtrl,
            templateUrl: 'components/forwarder/forwarder-directive.html'});

    ForwarderCtrl.$inject = ['$mdToast', 'forwarder'];

    function ForwarderCtrl($mdToast, forwarder) {
        this.rules = forwarder.getRulesArray();
        this.addRow = forwarder.createRule;
        this.delRow = deleteRow;
        this.refresh = refresh;

        function deleteRow($index) {
            forwarder
                .deleteRule($index)
                .then(function() { $mdToast.showSimple('Deleted rule'); })
        }

        function refresh() {
            forwarder
                .reloadRules()
                .then(function() { $mdToast.showSimple('Reloaded rules'); });
        }
    }
})(angular);
