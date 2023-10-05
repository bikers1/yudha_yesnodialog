/** @odoo-module */

import { registry } from '@web/core/registry';
import { YesNonDialog } from "@pest_widget/js/yesno_dialog/yesno_dialog";
import { formView } from '@web/views/form/form_view';
import { FormController } from '@web/views/form/form_controller';
import { FormRenderer } from '@web/views/form/form_renderer';
import {
    useService,
} from "@web/core/utils/hooks";

export class PurchseOrderYesNoFormController extends FormController {
    setup() {
        super.setup(...arguments);
        this.dialogService = useService("dialog");
        this.orm = useService("orm");
    }
    async beforeExecuteActionButton(clickParams) {
        const action = clickParams.name;
        const record = this.model.root;
        if(action==="action_send_mail"){
            if (this.model.root.data.model ==='sale.order'){
                return new Promise((resolve) => {
                    this.dialogService.add(YesNonDialog, {
                        body: this.env._t("Are you want to send another email?."),
                        confirmyes: async () => {
                            await this.orm.write(this.model.root.data.model, [this.model.root.data.res_id], {
                             state: 'approved',
                             });
                            resolve(true);
                        },
                        confirmno: async () => {
                            await this.orm.write(this.model.root.data.model, [this.model.root.data.res_id], {
                             state: 'sent',
                             });
                            resolve(true);
                        },
                    }, {
                        onClose: resolve.bind(null, false),
                    });
                });
            }
        }
        return super.beforeExecuteActionButton(clickParams);
    }
}

export const PurchaseOrderYesNoKonfirmFormView = {
    ...formView,
    Controller: PurchseOrderYesNoFormController,
  //  buttonTemplate: "pest_service_order.RegeneratorTicketListController.Buttons",
};
registry.category("views").add("purchase_order_yesno", PurchseOrderYesNoFormController);
