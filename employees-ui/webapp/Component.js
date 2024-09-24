sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/resource/ResourceModel"
], (UIComponent, JSONModel, ResourceModel) => {
  "use strict";

  return UIComponent.extend("ui5.quickstart.Component", {
     metadata : {
        "interfaces": ["sap.ui.core.IAsyncContentCreation"],
        "rootView": {
           "viewName": "ui5.quickstart.view.App",
           "type": "XML",
           "id": "app"
        }
     },

     init() {
        // call the init function of the parent
        UIComponent.prototype.init.apply(this, arguments);

        // set i18n model
        const i18nModel = new ResourceModel({
           bundleName: "ui5.quickstart.i18n.i18n"
        });
        this.setModel(i18nModel, "i18n");
     }
  });
});
