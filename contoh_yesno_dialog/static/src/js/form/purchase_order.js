/** @odoo-module */

/*
* Author   => Albertus Restiyanto Pramayudha
* email    => xabre0010@gmail.com
* linkedin => https://www.linkedin.com/in/albertus-restiyanto-pramayudha-470261a8/
* youtube  => https://www.youtube.com/channel/UCCtgLDIfqehJ1R8cohMeTXA
*/
import { registry } from '@web/core/registry';
import { YesNonDialog } from "@yudha_yesno_dialog/js/component/yesno_dialog";
import { formView } from '@web/views/form/form_view';
import { FormController } from '@web/views/form/form_controller';
import { FormRenderer } from '@web/views/form/form_renderer';
import {
    useService,
} from "@web/core/utils/hooks";

export class PurchaseOrderYesNoFormController extends FormController {
    setup() {
        super.setup(...arguments);
        this.dialogService = useService("dialog");
        this.orm = useService("orm");
    }
    async beforeExecuteActionButton(clickParams) {
        const action = clickParams.name;
        const record = this.model.root;
        if(action==="action_set_state"){
            return new Promise((resolve) => {
                this.dialogService.add(YesNonDialog, {
                    body: this.env._t("Are you want to set state to sent?."),
                    confirmyes: async () => {
                        await this.orm.write(this.model.root.resModel, [this.model.root.resId], {
                         state: 'done',
                         });
                        resolve(true);
                    },
                    confirmno: async () => {
                        await this.orm.write(this.model.root.resModel, [this.model.root.resId], {
                         state: 'sent',
                         });
                        resolve(true);
                    },
                }, {
                    onClose: resolve.bind(null, false),
                });
            });
        }
        return super.beforeExecuteActionButton(clickParams);
    }
}

export const PurchaseOrderYesNoKonfirmFormView = {
    ...formView,
    Controller: PurchaseOrderYesNoFormController,
};
registry.category("views").add("purchase_order_yesno", PurchaseOrderYesNoKonfirmFormView);
