/** @odoo-module */

import { Dialog } from "@web/core/dialog/dialog";
import { _lt } from "@web/core/l10n/translation";
import { useChildRef } from "@web/core/utils/hooks";

import { Component } from "@odoo/owl";

export class YesNonDialog extends Component {
    setup() {
        this.env.dialogData.close = () => this._cancel();
        this.modalRef = useChildRef();
        this.isConfirmedOrCancelled = false; // ensures we do not confirm and/or cancel twice
    }
    async _cancel() {
        if (this.isConfirmedOrCancelled) {
            return;
        }
        this.isConfirmedOrCancelled = true;
        this.disableButtons();
        if (this.props.cancel) {
            try {
                await this.props.cancel();
            } catch (e) {
                this.props.close();
                throw e;
            }
        }
        this.props.close();
    }
    async _confirm_yes() {
        if (this.isConfirmedOrCancelled) {
            return;
        }
        this.isConfirmedOrCancelled = true;
        this.disableButtons();
        if (this.props.confirmyes) {
            try {
                await this.props.confirmyes();
            } catch (e) {
                this.props.close();
                throw e;
            }
        }
        this.props.close();
    }
    async _confirm_no() {
        if (this.isConfirmedOrCancelled) {
            return;
        }
        this.isConfirmedOrCancelled = true;
        this.disableButtons();
        if (this.props.confirmno) {
            try {
                await this.props.confirmno();
            } catch (e) {
                this.props.close();
                throw e;
            }
        }
        this.props.close();
    }
    disableButtons() {
        if (!this.modalRef.el) {
            return; // safety belt for stable versions
        }
        for (const button of [...this.modalRef.el.querySelectorAll(".modal-footer button")]) {
            button.disabled = true;
        }
    }
}
YesNonDialog.template = "web.YesNoDialog";
YesNonDialog.components = { Dialog };
YesNonDialog.props = {
    close: Function,
    title: {
        validate: (m) => {
            return (
                typeof m === "string" || (typeof m === "object" && typeof m.toString === "function")
            );
        },
        optional: true,
    },
    body: String,
    confirmyes: { type: Function, optional: true },
    confirmno: { type: Function, optional: true },
    confirmLabelYes: { type: String, optional: true },
    confirmLabelNo: { type: String, optional: true },
};
YesNonDialog.defaultProps = {
    confirmLabelYes: _lt("Yes"),
    confirmLabelNo: _lt("No"),
    title: _lt("Confirmation"),
};

export class YesNoAlertDialog extends YesNonDialog {}
YesNoAlertDialog.template = "web.YesNoAlertDialog";
YesNoAlertDialog.props = {
    ...YesNonDialog.props,
    contentClass: { type: String, optional: true },
};
YesNoAlertDialog.defaultProps = {
    ...YesNonDialog.defaultProps,
    title: _lt("Alert"),
};
