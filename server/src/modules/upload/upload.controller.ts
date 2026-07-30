import {
  Body,
  Controller,
  Delete,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/interfaces/jwt.interface';
import { CurrentUser } from '../../decorators/user-decorators';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import {
  avatarUploadOptions,
  logoUploadOptions,
  productUploadOptions,
} from './config/multer.config';
import { UploadProductImageDto } from './dto/upload-product-image.dto';
import { UploadService } from './upload.service';

@ApiTags('Uploads')
@ApiBearerAuth('access-token')
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload current user profile avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded and linked to profile' })
  @UseInterceptors(FileInterceptor('file', avatarUploadOptions))
  uploadAvatar(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.uploadService.uploadAvatar(file, user.sub);
  }

  @Post('organizations/:orgId/logo')
  @ApiOperation({ summary: 'Upload organization logo (OWNER/ADMIN only)' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Logo uploaded and linked to organization' })
  @UseInterceptors(FileInterceptor('file', logoUploadOptions))
  uploadOrganizationLogo(
    @Param('orgId') orgId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.uploadService.uploadOrganizationLogo(
      orgId,
      file,
      user.sub,
      user.role,
    );
  }

  @Post('organizations/:orgId/products/:productId/images')
  @ApiOperation({
    summary: 'Upload product image (organization OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        alt: { type: 'string', example: 'Front view of product' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Product image uploaded' })
  @UseInterceptors(FileInterceptor('file', productUploadOptions))
  uploadProductImage(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @Body() dto: UploadProductImageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.uploadService.uploadProductImage(
      orgId,
      productId,
      file,
      user.sub,
      user.role,
      dto.alt,
    );
  }

  @Delete('organizations/:orgId/products/:productId/images/:imageId')
  @ApiOperation({
    summary: 'Delete a product image (organization OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  deleteProductImage(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.uploadService.deleteProductImage(
      orgId,
      productId,
      imageId,
      user.sub,
      user.role,
    );
  }
}
