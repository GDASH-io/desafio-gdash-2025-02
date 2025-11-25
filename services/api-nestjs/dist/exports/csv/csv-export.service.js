"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvExportService = void 0;
const common_1 = require("@nestjs/common");
const fast_csv_1 = require("fast-csv");
let CsvExportService = class CsvExportService {
    generateCsvStream(data, headers) {
        const csvStream = (0, fast_csv_1.format)({ headers: headers ? headers : true });
        data.forEach(item => {
            const row = {};
            headers?.forEach((header) => {
                row[String(header)] = item[header];
            });
            csvStream.write(row);
        });
        csvStream.end();
        return csvStream;
    }
};
exports.CsvExportService = CsvExportService;
exports.CsvExportService = CsvExportService = __decorate([
    (0, common_1.Injectable)()
], CsvExportService);
//# sourceMappingURL=csv-export.service.js.map