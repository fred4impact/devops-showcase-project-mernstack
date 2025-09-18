"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const AWS = require("aws-sdk");
let S3Service = class S3Service {
    constructor(configService) {
        this.configService = configService;
        this.s3 = new AWS.S3({
            accessKeyId: this.configService.get('S3_ACCESS_KEY'),
            secretAccessKey: this.configService.get('S3_SECRET_KEY'),
            region: this.configService.get('S3_REGION', 'us-east-1'),
        });
    }
    async uploadFile(file, key, contentType, bucket) {
        const bucketName = bucket || this.configService.get('S3_BUCKET');
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: file,
            ContentType: contentType,
            ACL: 'public-read',
        };
        const result = await this.s3.upload(params).promise();
        return result.Location;
    }
    async uploadTicketPDF(pdfBuffer, ticketId) {
        const key = `tickets/${ticketId}.pdf`;
        return this.uploadFile(pdfBuffer, key, 'application/pdf');
    }
    async uploadEventImage(imageBuffer, eventId, filename) {
        const key = `events/${eventId}/images/${filename}`;
        return this.uploadFile(imageBuffer, key, 'image/jpeg');
    }
    async deleteFile(key, bucket) {
        const bucketName = bucket || this.configService.get('S3_BUCKET');
        await this.s3.deleteObject({
            Bucket: bucketName,
            Key: key,
        }).promise();
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map