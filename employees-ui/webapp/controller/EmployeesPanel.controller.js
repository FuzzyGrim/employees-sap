sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "./ODataService",
  ],
  function (
    Controller,
    JSONModel,
    MessageBox,
    Filter,
    FilterOperator,
    ODataService
  ) {
    "use strict";

    return Controller.extend("ui.quickstart.controller.EmployeesPanel", {
      onPress: function (oEvent) {
        const oRouter = this.getOwnerComponent().getRouter();
        const employeeId = oEvent.getSource().data("employeeId");
        oRouter.navTo("detail", {
          employeeId: employeeId,
        });
      },

      onDeletePress: function (oEvent) {
        var employeeId = oEvent.getSource().data("employeeId");
        const oBundle = this.getView().getModel("i18n").getResourceBundle();
        var oModel = this.getView().getModel("service");

        MessageBox.confirm(oBundle.getText("delete-confirm"), {
          title: oBundle.getText("delete-title"),
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              ODataService.deleteEmployee(oModel, oBundle, employeeId);
            }
          },
        });
      },

      onEditPress: async function (oEvent) {
        var employeeId = oEvent.getSource().data("employeeId");
        var oModel = this.getView().getModel("service");
        var employee = await ODataService.getEmployeeById(oModel, employeeId);

        this._oDialog ??= await this.loadFragment({
          name: "ui5.quickstart.view.EmployeeDialog",
        });
        this._oDialog.setModel(new JSONModel(employee), "employee");
        this._oDialog.open();
      },

      onCancelDialogPress: function () {
        this._oDialog.close();
      },

      onSaveDialogPress: function (oEvent) {
        var employeeId = oEvent.getSource().data("employeeId");
        var oModel = this.getView().getModel("service");
        var updatedData = this._oDialog.getModel("employee").getData();
        const oBundle = this.getView().getModel("i18n").getResourceBundle();

        ODataService.updateEmployee(oModel, oBundle, updatedData, employeeId);
        this._oDialog.close();
      },

      onFilterEmployees: function (oEvent) {
        // build filter array
        const aFilter = [];
        const sQuery = oEvent.getParameter("query");
        if (sQuery) {
          aFilter.push(new Filter("name", FilterOperator.Contains, sQuery));
        }

        // filter binding
        const oList = this.byId("employeesTable");
        const oBinding = oList.getBinding("items");
        oBinding.filter(aFilter);
      },
    });
  }
);
