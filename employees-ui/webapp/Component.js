sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"],
  function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("ui.quickstart.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        var i18nModel = new sap.ui.model.resource.ResourceModel({
          bundleUrl: "i18n/i18n.properties",
        });
        sap.ui.getCore().setModel(i18nModel, "i18n");

        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // create the views based on the url/hash
        this.getRouter().initialize();
      },
    });
  }
);
