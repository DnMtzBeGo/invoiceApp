import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormControlOptions, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { BegoDialogService } from '@begomx/ui-components';
import { animate, style, transition, trigger } from '@angular/animations';

import { BillsDialogComponent } from './bills-dialog/bills-dialog.component';
import {
  IAmounts,
  IEmitterCatalogs,
  IInvoicePayment,
  IMultiplePaymentCatalogs,
  IPageChangeEvent,
  IPaymentComplementDialogParams,
  IPaymentPayload,
  IPaymentTotals,
  IPaymentV2,
  IReceiverCatalogs,
  ISelecAtionParams,
  ITaxesDR,
  ICFDITax,
  ICFDITaxes,
  IReceiverAddress,
  IExpeditionPlace,
  IMultiplePaymentModalFlags,
  IRelatedDocumentEdit,
  IInvoiceChildPayment,
} from './interfaces';
import { TaxFactor, TaxCodes, IVARates } from './enums';
import { _importe, _importeMXN } from './helpers';
import { ApiRestService } from 'src/app/services/api-rest.service';

const styleSlideOut = { transform: 'translateX(-100%)' };
@Component({
  selector: 'app-payment-complement-modal',
  templateUrl: './multiple-payment-modal.component.html',
  styleUrls: ['./multiple-payment-modal.component.scss'],
  animations: [
    trigger('slideLeft', [
      transition(':enter', [style(styleSlideOut), animate('500ms ease-in', style({ transform: 'translateX(0)' }))]),
      transition(':leave', [animate('200ms ease-out', style(styleSlideOut))]),
    ]),
  ],
})
export class MultiplePaymentModalComponent implements OnInit {
  public readonly: boolean = false;
  public paymentChainDescription: string = '';
  public emisor: FormGroup;
  public receptor: FormGroup;
  public pago: FormGroup;
  public requiredOptions: FormControlOptions;
  public selectedPaymentBills: IInvoicePayment[] = [];
  public catalogs: IMultiplePaymentCatalogs = {
    regimen_fiscal: [],
    formas_de_pago: [],
    moneda: [],
  };
  public emitterCatalogs: IEmitterCatalogs = {
    expedition_places: [],
    series: [],
  };

  public receiverCatalogs: IReceiverCatalogs = {
    addresses: [],
  };

  public amounts: IAmounts = {
    payed: 0,
    pending: 0,
    totalIVAWithholdings: 0,
    totalTransfersBase16: 0,
    totalTransfersTax16: 0,
    totalTransfersBase8: 0,
    totalTransfersTax8: 0,
    totalTransfersBase0: 0,
    totalTransfersTax0: 0,
    totalTransfersBaseExempt: 0,
  };

  public billsTable: any = {};
  public flags: IMultiplePaymentModalFlags = { optionalPaymentDataFlag: false };

  public activeEditBill: IRelatedDocumentEdit;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IPaymentComplementDialogParams,
    private readonly dialogRef: MatDialogRef<MultiplePaymentModalComponent>,
    private readonly childDialog: MatDialog,
    private readonly formBuilder: FormBuilder,
    private readonly api: ApiRestService,
    private readonly begoDialog: BegoDialogService,
  ) {
    //prettier-ignore
    this._initRequiredFielOptions()
        ._loadCatalogs()
        ._initReceiver()
        ._initEmitter()
        ._initPayment()
        ._initBillsTable()
        ._setEvents();
  }

  public ngOnInit(): void {
    if (this.data.invoices) this._appendSelectedBills(this.data.invoices);

    // TODO comment
    //this._setTestingData();
  }

  private _setEvents(): void {
    this.pago.get('forma').valueChanges.subscribe((forma: string) => {
      if (forma === '03') {
        this.pago.get('tipo_cadena_de_pago').setValue('01');
        this.paymentChainDescription = 'SPEI';
      } else {
        this.pago.get('tipo_cadena_de_pago').setValue(null);
        this.paymentChainDescription = '';
      }
    });

    this.pago.get('moneda').valueChanges.subscribe((value) => {
      if (value && value !== 'MXN') this.pago.get('tipo_de_cambio').addValidators([Validators.required]);
      else {
        this.pago.get('tipo_de_cambio').clearValidators();
        this.pago.get('tipo_de_cambio').setValue('');
      }

      this.pago.get('tipo_de_cambio').updateValueAndValidity();
    });

    this.pago.get('monto').valueChanges.subscribe((monto: number) => {
      this._assignBillsPaymentAmount();
      this.amounts.payed = monto;
    });
  }

  private _setCheckboxOnInvoices(bills: IInvoicePayment[]): IInvoicePayment[] {
    bills.forEach((bill: IInvoicePayment) => {
      bill.selection_check = true;
    });

    return bills;
  }

  private _sortInvoicesBySeriesAndFolio(invoices: IInvoicePayment[]): IInvoicePayment[] {
    invoices.sort((a: IInvoicePayment, b: IInvoicePayment) => {
      return a.serie_label < b.serie_label ? -1 : 1;
    });

    return invoices;
  }

  private _setEmitterAndReceiverData(): void {
    if (this.selectedPaymentBills.length) {
      const invoice = this.selectedPaymentBills[0];

      if (invoice.receptor.rfc) {
        this.receptor.get('rfc').setValue(invoice.receptor.rfc);
        this.receptor.get('razon_social').setValue(invoice.receptor.nombre);
        this.receptor.get('regimen_fiscal').setValue(invoice.receptor.regimen_fiscal);

        this._loadRelatedReceiverCatalogs(invoice.receptor.rfc);
      }

      if (invoice.emisor.rfc) {
        this.emisor.get('_id').setValue(invoice.emisor._id);
        this.emisor.get('rfc').setValue(invoice.emisor.rfc);
        this.emisor.get('razon_social').setValue(invoice.emisor.nombre);
        this.emisor.get('regimen_fiscal').setValue(invoice.emisor.regimen_fiscal);

        this._loadRelatedEmitterCatalogs();
      }
    }
  }

  private _loadRelatedEmitterCatalogs(): void {
    this.api.request('GET', `invoice/catalogs/multiple-payment/emitter`).subscribe((res) => {
      this.emitterCatalogs = {
        ...res.result,
      };
    });
  }

  private _loadRelatedReceiverCatalogs(rfc: string): void {
    this.api.request('GET', `invoice/catalogs/multiple-payment/receiver?rfc=${rfc}`).subscribe((res) => {
      this.receiverCatalogs = {
        ...res.result,
      };
    });
  }

  private _initRequiredFielOptions(): MultiplePaymentModalComponent {
    this.requiredOptions = { validators: [Validators.required] };
    return this;
  }

  private _initReceiver(): MultiplePaymentModalComponent {
    this.receptor = this.formBuilder.group({
      rfc: new FormControl('', this.requiredOptions),
      direccion: new FormControl(null, this.requiredOptions),
      razon_social: new FormControl('', this.requiredOptions),
      regimen_fiscal: new FormControl('', this.requiredOptions),
      uso_cfdi: new FormControl(''),
    });

    return this;
  }

  private _initEmitter(): MultiplePaymentModalComponent {
    this.emisor = this.formBuilder.group({
      _id: new FormControl(''),
      rfc: new FormControl('', this.requiredOptions),
      razon_social: new FormControl('', this.requiredOptions),
      regimen_fiscal: new FormControl('', this.requiredOptions),
      serie: new FormControl(null, this.requiredOptions),
      lugar_de_expedicion: new FormControl(null, this.requiredOptions),
    });

    return this;
  }

  public _setTestingData(): void {
    this.emisor.get('serie').setValue(null);
    this.emisor.get('lugar_de_expedicion').setValue('6294fd0a5a79a1aaa2150d1c');

    this.receptor.get('direccion').setValue(null);

    this.pago.get('fecha').setValue(new Date());
    this.pago.get('hora').setValue('10:20 AM');
    this.pago.get('forma').setValue('03');
    this.pago.get('moneda').setValue('MXN');
    this.pago.get('numero_de_operacion').setValue('123456');
    this.pago.get('forma').setValue('03');
    this.pago.get('monto').setValue('1.12');
    this.pago.get('tipo_cadena_de_pago').setValue('01');
  }

  private _initPayment(): MultiplePaymentModalComponent {
    this.pago = this.formBuilder.group({
      fecha: new FormControl('', this.requiredOptions),
      hora: new FormControl('', this.requiredOptions),
      forma: new FormControl('', this.requiredOptions),
      moneda: new FormControl(null, this.requiredOptions),
      tipo_de_cambio: new FormControl('', { validators: [] }),
      numero_de_operacion: new FormControl(''),
      monto: new FormControl('', this.requiredOptions),
      rfc_emisor_cuenta_ordenante: new FormControl(''),
      cuenta_ordenante: new FormControl(''),
      rfc_emisor_cuenta_beneficiario: new FormControl(''),
      cuenta_beneficiario: new FormControl(''),
      tipo_cadena_de_pago: new FormControl(''),
    });

    return this;
  }

  private _initBillsTable(): MultiplePaymentModalComponent {
    this.billsTable = {
      loading: false,
      tableColumns: [
        {
          id: 'uuid',
          label: 'UUID',
        },
        {
          id: 'serie_label',
          label: 'Serie',
        },
        {
          id: 'folio',
          label: 'Folio',
        },
        {
          id: 'moneda',
          label: 'Moneda',
        },
        {
          id: 'tipo_de_cambio',
          label: 'Tipo de Cambio',
        },
        {
          id: 'np',
          label: 'No. P',
        },
        {
          id: 'total',
          label: 'Total',
        },
        {
          id: 'saldo_pendiente',
          label: 'Saldo Pendiente',
        },
        {
          id: 'monto_a_pagar',
          label: 'Monto a Pagar',
        },
      ],
      pageUi: { size: 100, index: 1, total: 0, pages: 0 },
      tableActions: [
        { label: 'Editar', id: 'edit', icon: 'edit-fintech' },
        { label: 'Eliminar', id: 'remove', icon: 'trash' },
      ],
      tableValues: [],
      page: {
        pageIndex: 0,
        index: 1,
      },
      selectRow: {
        showColumnSelection: false,
        selectionLimit: 0,
        keyPrimaryRow: 'uuid',
      },
      pageChange: ({ index, size }: IPageChangeEvent) => {
        this.billsTable.page.pageIndex = index;
        this.billsTable.pageUi.index = index;
        if (this.billsTable.pageUi.size !== size) {
          this.billsTable.page.pageIndex = 1;
          this.billsTable.pageUi.index = 1;
        }
        this.billsTable.page.pageSize = size;
        this.billsTable.pageChange.emit(this.billsTable.page);
      },
      selectAction: ({ type, data }: ISelecAtionParams) => {
        switch (type) {
          case 'edit':
            this.activeEditBill = {
              ...data,
              folio: +data.folio,
              tipo_de_cambio: +data.tipo_de_cambio,
              parcialidad: +data.np,
              saldo_pendiente: +data.saldo_pendiente,
              monto_a_pagar: +data.monto_a_pagar,
            };
            break;
          case 'remove':
            const index = this.billsTable.tableValues.findIndex(({ uuid }: IInvoicePayment) => uuid === data.uuid);
            this.billsTable.tableValues.splice(index, 1);
            this.billsTable.tableValues = [...this.billsTable.tableValues];
            this._calculateAmounts();
            break;
        }
      },
    };

    return this;
  }

  public close(confirm: boolean = true): void {
    if (confirm)
      this.begoDialog.open({
        type: 'action',
        title: '¿Desea continuar?',
        content: 'Se perderán todos los cambios realizados para la generacion del pago.',
        btnCopies: {
          confirm: 'Si',
          cancel: 'Cancelar',
        },
        handleAction: (action: string): void => {
          switch (action) {
            case 'confirm':
              this.dialogRef.close();
              break;
          }
        },
      });
    else {
      this.dialogRef.close({ created: true });
    }
  }

  public submit(): void {
    const _runValidators = async () => {
      this.receptor.markAllAsTouched();
      this.emisor.markAllAsTouched();
      this.pago.markAllAsTouched();
    };

    const _paymentAmountAndBillsTotalAreEqual = (): boolean => {
      const paymentAmount = +this.pago.get('monto').value;

      return paymentAmount === +this.amounts.payed;
    };

    const _isAllValid = (): boolean => {
      return Boolean(this.receptor.valid && this.emisor.valid && this.pago.valid && this.selectedPaymentBills.length);
    };

    const _existsSomeBillWithNoPayment = (): boolean => {
      for (const { monto_a_pagar } of this.billsTable.tableValues) if (monto_a_pagar <= 0) return true;
      return false;
    };

    const _buildWithholdingsDR = (retenciones: ICFDITax | ICFDITax[]) => {
      let retenciones_dr = null;

      retenciones = retenciones && !Array.isArray(retenciones) ? [retenciones] : retenciones;

      if (Array.isArray(retenciones)) {
        retenciones_dr = retenciones?.map((retencion: ICFDITax) => {
          switch (retencion.Impuesto) {
            case TaxCodes.IVA:
              this.amounts.totalIVAWithholdings += _importe(retencion.Importe);
              break;
            case TaxCodes.ISR:
              this.amounts.totalISRWithholdings += _importe(retencion.Importe);
              break;
            case TaxCodes.IEPS:
              this.amounts.totalIEPSWithholdings += _importe(retencion.Importe);
              break;
          }

          return {
            base_dr: _importe(retencion.Base),
            impuesto_dr: retencion.Impuesto,
            tipo_factor_dr: retencion.TipoFactor,
            tasa_o_cuota_dr: _importe(retencion.TasaOCuota),
            importe_dr: _importe(retencion.Importe),
          };
        });
      }

      return retenciones_dr;
    };

    const _buildTransfersDR = (traslados: ICFDITax | ICFDITax[]) => {
      let traslados_dr = null;

      traslados = !Array.isArray(traslados) && traslados ? [traslados] : traslados;

      if (Array.isArray(traslados) && traslados.length) {
        traslados_dr = traslados?.map((traslado: ICFDITax) => {
          const trasladoObj = {
            base_dr: _importe(traslado.Base),
            impuesto_dr: traslado.Impuesto,
            tipo_factor_dr: traslado.TipoFactor,
          };

          if (TaxCodes.IVA === traslado.Impuesto) {
            if (traslado.TipoFactor === TaxFactor.Exento) {
              this.amounts.totalTransfersBaseExempt += _importe(traslado.Base);
            } else {
              trasladoObj['tasa_o_cuota_dr'] = _importe(traslado.TasaOCuota);
              trasladoObj['importe_dr'] = _importe(traslado.Importe);

              switch (+traslado.TasaOCuota) {
                case IVARates.P16:
                  this.amounts.totalTransfersBase16 += _importe(traslado.Base);
                  this.amounts.totalTransfersTax16 += _importe(traslado.Importe);
                  break;

                case IVARates.P08:
                  this.amounts.totalTransfersBase8 += _importe(traslado.Base);
                  this.amounts.totalTransfersTax8 += _importe(traslado.Importe);
                  break;

                case IVARates.P0:
                  this.amounts.totalTransfersBase0 += _importe(traslado.Base);
                  this.amounts.totalTransfersTax0 += _importe(traslado.Importe);
                  break;
              }
            }
          }

          return trasladoObj;
        });
      }

      return traslados_dr;
    };

    const _buildTaxesDR = (impuestos: ICFDITaxes): ITaxesDR => {
      return _cleanEmpty<ITaxesDR>({
        traslados_dr: _buildTransfersDR(impuestos.traslados),
        retenciones_dr: _buildWithholdingsDR(impuestos.retenciones),
      });
    };

    const _parseObjectImp = (object_imp: string | string[]): string => {
      if (Array.isArray(object_imp)) return object_imp[0];
      else return object_imp;
    };

    const _buildPayment = (): IPaymentV2 => {
      this.amounts.totalTransfersBase16 = 0;
      this.amounts.totalTransfersTax16 = 0;
      this.amounts.totalIVAWithholdings = 0;

      const payment: IPaymentV2 = {
        version: '2.0',
        fecha_pago: this.pago.get('fecha').value,
        hora: this.pago.get('hora').value,
        forma_de_pago_p: this.pago.get('forma').value,
        monto: _importe(this.pago.get('monto').value),
        moneda_p: this.pago.get('moneda').value,
        tipo_cambio_p: _importe(this.pago.get('tipo_de_cambio').value) || 1,
        num_operacion: this.pago.get('numero_de_operacion').value,
        rfc_emisor_cta_ord: this.pago.get('rfc_emisor_cuenta_ordenante').value,
        cta_ordenante: this.pago.get('cuenta_ordenante').value,
        rfc_emisor_cta_ben: this.pago.get('rfc_emisor_cuenta_beneficiario').value,
        cta_beneficiario: this.pago.get('cuenta_beneficiario').value,
        tipo_cadena_de_pago: this.pago.get('tipo_cadena_de_pago').value,
        documentos_relacionados: this.billsTable.tableValues.map(
          ({ uuid, impuestos, serie_label, folio, moneda, np, total, monto_a_pagar, objeto_imp }: IInvoicePayment) => {
            return {
              id_documento: uuid,
              impuestos_dr: _buildTaxesDR(impuestos),
              serie: serie_label,
              folio,
              moneda_dr: moneda,
              // TODO: consider cases when currency type is different between payment and related document
              equivalencia_dr: 1,
              num_parcialidad: np,
              imp_saldo_ant: _importe(total),
              imp_pagado: _importe(monto_a_pagar),
              // TODO: SALDO PENDIENTE
              imp_saldo_insoluto: +(_importe(total) - _importe(monto_a_pagar)).toFixed(2),
              objeto_imp_dr: _parseObjectImp(objeto_imp),
            };
          },
        ),
        impuestos_p: {},
      };

      if (
        this.amounts.totalTransfersBase16 ||
        this.amounts.totalTransfersBase8 ||
        this.amounts.totalTransfersBase0 ||
        this.amounts.totalTransfersBaseExempt
      )
        payment.impuestos_p.traslados_p = [];

      if (this.amounts.totalIVAWithholdings || this.amounts.totalISRWithholdings || this.amounts.totalIEPSWithholdings)
        payment.impuestos_p.retenciones_p = [];

      if (this.amounts.totalTransfersBase16)
        payment.impuestos_p.traslados_p.push({
          base_p: _importe(this.amounts.totalTransfersBase16 * payment.tipo_cambio_p),
          impuesto_p: TaxCodes.IVA,
          tipo_factor_p: TaxFactor.Tasa,
          tasa_o_cuota_p: 0.16,
          importe_p: _importe(this.amounts.totalTransfersTax16 * payment.tipo_cambio_p),
        });

      if (this.amounts.totalTransfersBase8)
        payment.impuestos_p.traslados_p.push({
          base_p: _importe(this.amounts.totalTransfersBase8 * payment.tipo_cambio_p),
          impuesto_p: TaxCodes.IVA,
          tipo_factor_p: TaxFactor.Tasa,
          tasa_o_cuota_p: 0.08,
          importe_p: _importe(this.amounts.totalTransfersTax8 * payment.tipo_cambio_p),
        });

      if (this.amounts.totalTransfersBase0)
        payment.impuestos_p.traslados_p.push({
          base_p: _importe(this.amounts.totalTransfersBase0 * payment.tipo_cambio_p),
          impuesto_p: TaxCodes.IVA,
          tipo_factor_p: TaxFactor.Tasa,
          tasa_o_cuota_p: 0,
          importe_p: _importe(this.amounts.totalTransfersTax0 * payment.tipo_cambio_p),
        });

      if (this.amounts.totalTransfersBaseExempt)
        payment.impuestos_p.traslados_p.push({
          base_p: _importe(this.amounts.totalTransfersBaseExempt * payment.tipo_cambio_p),
          impuesto_p: TaxCodes.IVA,
          tipo_factor_p: TaxFactor.Exento,
        });

      if (this.amounts.totalIVAWithholdings)
        payment.impuestos_p.retenciones_p.push({
          impuesto_p: TaxCodes.IVA,
          importe_p: _importe(this.amounts.totalIVAWithholdings * payment.tipo_cambio_p),
        });

      if (this.amounts.totalISRWithholdings)
        payment.impuestos_p.retenciones_p.push({
          impuesto_p: TaxCodes.ISR,
          importe_p: _importe(this.amounts.totalISRWithholdings * payment.tipo_cambio_p),
        });

      if (this.amounts.totalIEPSWithholdings)
        payment.impuestos_p.retenciones_p.push({
          impuesto_p: TaxCodes.IEPS,
          importe_p: _importe(this.amounts.totalIEPSWithholdings * payment.tipo_cambio_p),
        });

      return _cleanEmpty<IPaymentV2>(payment);
    };

    const _buildTotals = (): IPaymentTotals =>
      _cleanEmpty({
        total_retenciones_iva: _importeMXN(this.amounts.totalIVAWithholdings),
        total_retenciones_isr: _importeMXN(this.amounts.totalISRWithholdings),
        total_retenciones_ieps: _importeMXN(this.amounts.totalIEPSWithholdings),
        total_traslados_base_iva_16: _importeMXN(this.amounts.totalTransfersBase16),
        total_traslados_impuesto_iva_16: _importeMXN(this.amounts.totalTransfersTax16),
        total_traslados_base_iva_8: _importeMXN(this.amounts.totalTransfersBase8),
        total_traslados_impuesto_iva_8: _importeMXN(this.amounts.totalTransfersTax8),
        total_traslados_base_iva_0: _importeMXN(this.amounts.totalTransfersBase0),
        total_traslados_impuesto_iva_0: _importeMXN(this.amounts.totalTransfersTax0),
        total_traslados_base_iva_exento: _importeMXN(this.amounts.totalTransfersBaseExempt),
        monto_total_pagos: _importeMXN(this.amounts.payed),
      });

    const _getReceiverAddresData = (address_id: string): IReceiverAddress => {
      return _cleanEmpty<IReceiverAddress>(
        this.receiverCatalogs.addresses.find((address) => address._id === address_id),
      );
    };

    const _generatePayload = (): IPaymentPayload => {
      const payload: IPaymentPayload = {
        version: '4.0',
        exportacion: '01',

        tipo_de_comprobante: 'P',
        serie: this.emisor.get('serie').value,
        lugar_de_expedicion: _cleanEmpty<IExpeditionPlace>(
          this.emitterCatalogs.expedition_places.find((ep) => ep._id === this.emisor.get('lugar_de_expedicion').value),
        ),
        emisor: {
          _id: this.emisor.get('_id').value,
          rfc: this.emisor.get('rfc').value,
          nombre: this.emisor.get('razon_social').value,
          regimen_fiscal: this.emisor.get('regimen_fiscal').value,
        },
        receptor: {
          rfc: this.receptor.get('rfc').value,
          nombre: this.receptor.get('razon_social').value,
          regimen_fiscal: this.receptor.get('regimen_fiscal').value,
          uso_cfdi: 'CP01',
          direccion: _getReceiverAddresData(this.receptor.get('direccion').value),
        },
        moneda: 'XXX',
        subtotal: 0,
        conceptos: [
          {
            clave_prod_serv: '84111506',
            cantidad: 1,
            clave_unidad: 'ACT',
            descripcion: 'Pago',
            valor_unitario: 0,
            importe: 0,
            objeto_imp: '01', // No
          },
        ],
        pago: _buildPayment(),
        totales: _buildTotals(),
        status: 1,
      };

      return _cleanEmpty<IPaymentPayload>(payload);
    };

    const _cleanEmpty = <T>(data: T): T => {
      return Object.fromEntries(
        Object.entries(data).filter(([_, v]) => {
          return (null != v && undefined != v && '' != v) || 0 === v;
        }),
      ) as T;
    };

    if (this.selectedPaymentBills.length) {
      _runValidators();

      if (_isAllValid()) {
        if (!_existsSomeBillWithNoPayment()) {
          if (_paymentAmountAndBillsTotalAreEqual()) {
            const body: IPaymentPayload = _generatePayload();

            this.api.request('POST', 'invoice/payments', { body: body }).subscribe((res) => {
              if (res?.result === 'created') this.close(false);
            });
          } else
            this._showInformativeDialog(
              'El monto del pago no coincide con la suma de montos a pagar de los documentos relacionados.',
            );
        } else
          this._showInformativeDialog(
            'No puede haber comprobantes sin pago, si no se hará un pago a un comprobante favor de eliminarlo del listado de comprobantes relacionados.',
          );
      } else this._showInformativeDialog('Falta información requerida.');
    }
  }

  private _showInformativeDialog(content: string, title: string = 'Validación'): void {
    this.begoDialog.open({
      title,
      content,
      type: 'informative',
      btnCopies: {
        confirm: 'Ok',
      },
    });
  }

  public openBillsDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = '950px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      selected: this.selectedPaymentBills.map((invoice) => invoice._id),
    };

    const dialog = this.childDialog.open(BillsDialogComponent, dialogConfig);

    dialog.afterClosed().subscribe((result) => {
      this._appendSelectedBills(result);
    });
  }

  private _calculateAmounts(): void {
    // taxes will be calculated at payment building method

    this.amounts.payed = +this.billsTable.tableValues.reduce(
      (accumulator: number, currentValue: IInvoicePayment) => accumulator + currentValue.monto_a_pagar,
      0,
    );

    this.amounts.pending = +this.billsTable.tableValues.reduce(
      (accumulator: number, currentValue: IInvoicePayment) => accumulator + currentValue.saldo_pendiente,
      0,
    );

    this.amounts = {
      ...this.amounts,
    };
  }

  private _assignBillsPaymentAmount(): void {
    let paymentAmount = +this.pago.get('monto').value;

    this.billsTable.tableValues = [
      ...this.billsTable.tableValues.map((bill: IInvoicePayment) => {
        if (!paymentAmount) bill.monto_a_pagar = 0;
        else if (paymentAmount - bill.saldo_pendiente >= 0) {
          bill.monto_a_pagar = bill.saldo_pendiente;
          paymentAmount -= bill.saldo_pendiente;
        } else {
          const substraction = paymentAmount - bill.saldo_pendiente;

          bill.monto_a_pagar = +this.toValidFormattedAmount(bill.saldo_pendiente + substraction);
          paymentAmount = 0;
        }

        return bill;
      }),
    ];

    this._calculateAmounts();
  }

  private _appendSelectedBills(bills: IInvoicePayment[]) {
    const _getBillConsecutive = (bill: IInvoicePayment): number => {
      return bill.payments?.length > 0 ? bill.payments.length + 1 : 1;
    };

    // TODO check if is needed to keep this line
    if (bills.length) this.data.invoices = this._sortInvoicesBySeriesAndFolio(bills);
    //if (bills.length) this.data.invoices = this._sortInvoicesBySeriesAndFolio(this._setCheckboxOnInvoices(bills));

    if (bills.length) {
      bills.forEach((bill: IInvoicePayment) => {
        if (!this.selectedPaymentBills.find((selected: IInvoicePayment) => bill.uuid === selected.uuid)) {
          this.selectedPaymentBills.push(bill);

          let payments: number = 0;
          if (bill.payments?.length) {
            payments = +bill.payments.reduce(
              (accumulator: number, currentValue: IInvoiceChildPayment) => accumulator + currentValue.amount,
              0,
            );

            bill.saldo_pendiente = +this.toValidFormattedAmount(bill.total - payments);
            bill.total = +this.toValidFormattedAmount(bill.total);
          } else {
            bill.saldo_pendiente = bill.total;
          }

          bill.np = _getBillConsecutive(bill);
        }

        bill.actions = {
          enabled: true,
          options: {
            edit: true,
            remove: true,
          },
        };
      });

      this.billsTable.tableValues = [...this.billsTable.tableValues, ...bills];
      this._assignBillsPaymentAmount();
    }
    // this._setSelectionMarks();

    this._setEmitterAndReceiverData();
  }

  private _loadCatalogs(): MultiplePaymentModalComponent {
    this.api.request('GET', 'invoice/catalogs/multiple-payment').subscribe((res) => {
      this.catalogs = {
        ...res.result,
      };

      // this._initDialogsConfig();
    });

    return this;
  }

  public saveEditedBill(edited: IRelatedDocumentEdit): void {
    let bill = this.billsTable.tableValues.find((bill: IRelatedDocumentEdit) => bill.uuid === edited.uuid);

    if (bill && this._validateEditedBill(edited)) {
      bill.monto_a_pagar = +edited.monto_a_pagar;
      this.billsTable.tableValues = [...this.billsTable.tableValues];
      this.activeEditBill = null;

      // update amounts based on bills table values
      this._calculateAmounts();
    }
  }

  private _validateEditedBill(edited: IRelatedDocumentEdit): boolean {
    let content = '';

    if (!edited.monto_a_pagar) content = 'El monto a pagar no puede dejarse vacio';

    if (edited.monto_a_pagar && +edited.saldo_pendiente < +edited.monto_a_pagar)
      content = 'El monto a pagar no puede ser mayor al saldo pendiente';

    if (content !== '') {
      this._showInformativeDialog(content);

      return false;
    }

    return true;
  }

  public toValidFormattedAmount(val: number | string): string {
    return _importe(val).toFixed(2);
  }
}
