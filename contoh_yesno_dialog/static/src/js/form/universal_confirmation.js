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
import { ListController } from '@web/views/list/list_controller';
import {
    useService,
} from "@web/core/utils/hooks";
import { patch, unpatch } from '@web/core/utils/patch';

patch(FormController.prototype, 'yudha_yesno_formctl', {
    getActionMenuItems() {
        const otherActionItems = [];
        if (this.archiveEnabled) {
            if (this.model.root.isActive) {
                otherActionItems.push({
                    key: "archive",
                    description: this.env._t("Archive"),
                    callback: () => {
                        const dialogProps = {
                            body: this.env._t("Are you sure that you want to archive this record?"),
                            confirmLabelYes: this.env._t("Archive"),
                            confirmyes: () => this.model.root.archive(),
                            confirmno: () => {},
                        };
                        this.dialogService.add(YesNonDialog, dialogProps);
                    },
                });
            } else {
                otherActionItems.push({
                    key: "unarchive",
                    description: this.env._t("Unarchive"),
                    callback: () => this.model.root.unarchive(),
                });
            }
        }
        if (this.archInfo.activeActions.create && this.archInfo.activeActions.duplicate) {
            otherActionItems.push({
                key: "duplicate",
                description: this.env._t("Duplicate"),
                callback: () => this.duplicateRecord(),
            });
        }
        if (this.archInfo.activeActions.delete && !this.model.root.isVirtual) {
            otherActionItems.push({
                key: "delete",
                description: this.env._t("Delete"),
                callback: () => this.deleteRecord(),
                skipSave: true,
            });
        }
        return Object.assign({}, this.props.info.actionMenus, { other: otherActionItems });
    },
    get deleteConfirmationDialogProps() {
        return {
            body: this.env._t("Are you sure you want to delete this record?"),
            confirmyes: async () => {
                await this.model.root.delete();
                if (!this.model.root.resId) {
                    this.env.config.historyBack();
                }
            },
            confirmno: () => {},
        };
    },

    async deleteRecord() {
        this.dialogService.add(YesNonDialog, this.deleteConfirmationDialogProps);
    },
});

patch(ListController.prototype, 'yudha_yesno_listctl', {
    get deleteConfirmationDialogProps() {
        const root = this.model.root;
        const body =
            root.isDomainSelected || root.selection.length > 1
                ? this.env._t("Are you sure you want to delete these records?")
                : this.env._t("Are you sure you want to delete this record?");
        return {
            body,
            confirmyes: async () => {
                const total = root.count;
                const resIds = await this.model.root.deleteRecords();
                this.model.notify();
                if (
                    root.isDomainSelected &&
                    resIds.length === session.active_ids_limit &&
                    resIds.length < total
                ) {
                    this.notificationService.add(
                        sprintf(
                            this.env._t(
                                `Only the first %s records have been deleted (out of %s selected)`
                            ),
                            resIds.length,
                            total
                        ),
                        { title: this.env._t("Warning") }
                    );
                }
            },
            confirmno: () => {},
        };
    },
    async onDeleteSelectedRecords() {
        this.dialogService.add(YesNonDialog, this.deleteConfirmationDialogProps);
    },
    getActionMenuItems() {
        const isM2MGrouped = this.model.root.isM2MGrouped;
        const otherActionItems = [];
        if (this.isExportEnable) {
            otherActionItems.push({
                key: "export",
                description: this.env._t("Export"),
                callback: () => this.onExportData(),
            });
        }
        if (this.archiveEnabled && !isM2MGrouped) {
            otherActionItems.push({
                key: "archive",
                description: this.env._t("Archive"),
                callback: () => {
                    const dialogProps = {
                        body: this.env._t(
                            "Are you sure that you want to archive all the selected records?"
                        ),
                        confirmLabelYes: this.env._t("Archive"),
                        confirmyes: () => {
                            this.toggleArchiveState(true);
                        },
                        confirmno: () => {},
                    };
                    this.dialogService.add(ConfirmationDialog, dialogProps);
                },
            });
            otherActionItems.push({
                key: "unarchive",
                description: this.env._t("Unarchive"),
                callback: () => this.toggleArchiveState(false),
            });
        }
        if (this.activeActions.delete && !isM2MGrouped) {
            otherActionItems.push({
                key: "delete",
                description: this.env._t("Delete"),
                callback: () => this.onDeleteSelectedRecords(),
            });
        }
        return Object.assign({}, this.props.info.actionMenus, { other: otherActionItems });
    },

});