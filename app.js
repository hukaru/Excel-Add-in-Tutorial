/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

'use strict';

require('./function-file/function-file.js');

(function () {

	Office.onReady()
	    .then(function() {
	        $(document).ready(function () {

                if (!Office.context.requirements.isSetSupported('ExcelApi', 1.7)) {
                    console.log('Sorry. The tutorial add-in uses Excel.js APIs that are not available in your version of Office.');
                }

                $('#create-table').click(createTable);
                $('#filter-table').click(filterTable);
                $('#sort-table').click(sortTable);
                $('#create-chart').click(createChart);
                $('#freeze-header').click(freezeHeader);
                $('#open-dialog').click(openDialog);

        });
    });

    function createTable() {
        Excel.run(function (context) {

            const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
            const expensesTable = currentWorksheet.tables.add("A1:D1", true /*hasHeaders*/);
            expensesTable.name = "ExpensesTable";

            expensesTable.getHeaderRowRange().values =
                [["Date", "Merchant", "Category", "Amount"]];

            expensesTable.rows.add(null /*add at the end*/, [
                ["1/1/2017", "The Phone Company", "Communications", "120"],
                ["1/2/2017", "Northwind Electric Cars", "Transportation", "142.33"],
                ["1/5/2017", "Best For You Organics Company", "Groceries", "27.9"],
                ["1/10/2017", "Coho Vineyard", "Restaurant", "33"],
                ["1/11/2017", "Bellows College", "Education", "350.1"],
                ["1/15/2017", "Trey Research", "Other", "135"],
                ["1/15/2017", "Best For You Organics Company", "Groceries", "97.88"]
            ]);

            expensesTable.columns.getItemAt(3).getRange().numberFormat = [['€#,##0.00']];
            expensesTable.getRange().format.autofitColumns();
            expensesTable.getRange().format.autofitRows();

            return context.sync();
        })
        .catch(function (error) {
            console.log("Error: " + error);
            if (error instanceof OfficeExtension.Error) {
                console.log("Debug info: " + JSON.stringify(error.debugInfo));
            }
        });
    }

    function filterTable() {
        Excel.run(function (context) {

            const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
            const expensesTable = currentWorksheet.tables.getItem('ExpensesTable');
            const categoryFilter = expensesTable.columns.getItem('Category').filter;
            categoryFilter.applyValuesFilter(["Education", "Groceries"]);

            return context.sync();
        })
        .catch(function (error) {
            console.log("Error: " + error);
            if (error instanceof OfficeExtension.Error) {
                console.log("Debug info: " + JSON.stringify(error.debugInfo));
            }
        });
    }

    function sortTable() {
        Excel.run(function (context) {

            const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
            const expensesTable = currentWorksheet.tables.getItem('ExpensesTable');
            const sortFields = [
                {
                    key: 1,            // Merchant column
                    ascending: false,
                }
            ];

            expensesTable.sort.apply(sortFields);

            return context.sync();
        })
        .catch(function (error) {
            console.log("Error: " + error);
            if (error instanceof OfficeExtension.Error) {
                console.log("Debug info: " + JSON.stringify(error.debugInfo));
            }
        });
    }

    function createChart() {
        Excel.run(function (context) {

            const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
            const expensesTable = currentWorksheet.tables.getItem('ExpensesTable');
            const dataRange = expensesTable.getDataBodyRange();

            let chart = currentWorksheet.charts.add('ColumnClustered', dataRange, 'auto');

            chart.setPosition("A15", "F30");
            chart.title.text = "Expenses";
            chart.legend.position = "right"
            chart.legend.format.fill.setSolidColor("white");
            chart.dataLabels.format.font.size = 15;
            chart.dataLabels.format.font.color = "black";

            return context.sync();
        })
        .catch(function (error) {
            console.log("Error: " + error);
            if (error instanceof OfficeExtension.Error) {
                console.log("Debug info: " + JSON.stringify(error.debugInfo));
            }
        });
    }

    function freezeHeader() {
        Excel.run(function (context) {

            const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
            currentWorksheet.freezePanes.freezeRows(1);

            return context.sync();
        })
        .catch(function (error) {
            console.log("Error: " + error);
            if (error instanceof OfficeExtension.Error) {
                console.log("Debug info: " + JSON.stringify(error.debugInfo));
            }
        });
    }

    let dialog = null;

    function openDialog() {
        Office.context.ui.displayDialogAsync(
            'https://accplan.herokuapp.com/popup.html',
            {height: 35, width: 25},

            function (result) {
                dialog = result.value;
                dialog.addEventHandler(Microsoft.Office.WebExtension.EventType.DialogMessageReceived, processMessage);
            }
        );
    }

    function processMessage(arg) {
        console.log(arg.message);
        $('#user-name').text(arg.message);
        dialog.close();
    }

})();