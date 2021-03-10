'use strict';

class DialogWindow {
  constructor(parent, mobile) {
    this.mobile = mobile;
    this.parent = parent;
    this.panel = document.createElement('div');
    parent.appendChild(this.panel);

    this.params = {
      appendTo: parent,
      open: () => { DialogWindow.openDialog(this.panel); },
      autoOpen: false,
      resizeStart: DialogWindow.disablePointerEvents,
      resizeStop: DialogWindow.enablePointerEvents,
      dragStart: DialogWindow.disablePointerEvents,
      dragStop: DialogWindow.enablePointerEvents
    };
    if (this.mobile)
      DialogWindow.addMobileDialogAttributes(this.params, this.panel);
  }

  static clampDialogSize(preferredGeometry) {
    if (typeof $('#playerDiv').height === 'undefined' || typeof $('#playerDiv').width === 'undefined')
      return preferredGeometry;

    const maxHeight = $('#playerDiv').height() - preferredGeometry.top - $('#toolBar').height() - 20; // 20 is chosen arbitrarily
    const maxWidth = $('#playerDiv').width() - preferredGeometry.left - 20; // 20 is chosen arbitrarily
    let height = preferredGeometry.height;
    let width = preferredGeometry.width;
    if (maxHeight < height)
      height = maxHeight;
    if (maxWidth < width)
      width = maxWidth;
    return {width: width, height: height};
  }

  static openDialog(dialog) {
    DialogWindow.resizeDialogOnOpen(dialog);
    $(dialog).parent().css('opacity', 0.9);
    $(dialog).parent().hover(() => {
      $(dialog).css('opacity', 0.99);
    }, (event) => {
      $(dialog).css('opacity', 0.9);
    });
  }

  static resizeDialogOnOpen(dialog) {
    const w = $(dialog).parent().width();
    const h = $(dialog).parent().height();
    const clampedSize = DialogWindow.clampDialogSize({left: 0, top: 0, width: w, height: h});
    if (clampedSize.width < w)
      $(dialog).dialog('option', 'width', clampedSize.width);
    if (clampedSize.height < h)
      $(dialog).dialog('option', 'height', clampedSize.height);
  }

  static createMobileDialog() {
    // mobile only setup
    const closeButton = $('button:contains("WbClose")');
    closeButton.html('');
    closeButton.removeClass('ui-button-text-only');
    closeButton.addClass('mobile-dialog-close-button');
    closeButton.addClass('ui-button-icon-primary');
    closeButton.prepend('<span class="ui-icon ui-icon-closethick"></span>');
  }

  static addMobileDialogAttributes(params, panel) {
    params.dialogClass = 'mobile-no-default-buttons';
    params.create = DialogWindow.createMobileDialog;
    params.buttons = { 'WbClose': () => { $(panel).dialog('close'); } };
  }

  // The following two functions are used to make the resize and drag of the dialog
  // steady (i.e., not loose the grab while resizing/dragging the dialog quickly).
  static disablePointerEvents() {
    document.body.style['pointer-events'] = 'none';
  }

  static enablePointerEvents() {
    document.body.style['pointer-events'] = 'auto';
  }
}

export {DialogWindow};
