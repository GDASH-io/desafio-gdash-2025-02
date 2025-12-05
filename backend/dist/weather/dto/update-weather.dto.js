"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWeatherDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_weather_dto_1 = require("./create-weather.dto");
class UpdateWeatherDto extends (0, mapped_types_1.PartialType)(create_weather_dto_1.CreateWeatherDto) {
}
exports.UpdateWeatherDto = UpdateWeatherDto;
//# sourceMappingURL=update-weather.dto.js.map