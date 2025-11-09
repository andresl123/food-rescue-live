package com.foodrescue.lots.controller;

import com.foodrescue.lots.entity.ImportPreviewResponse;
import com.foodrescue.lots.entity.ImportResult;
import com.foodrescue.lots.service.ExcelLotImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
public class LotImportController {

    private final ExcelLotImportService excelLotImportService;

    @PostMapping(path = "/lots-excel/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ImportPreviewResponse> preview(@RequestPart("file") FilePart filePart) {
        return DataBufferUtils.join(filePart.content())
                .map(buf -> {
                    byte[] bytes = new byte[buf.readableByteCount()];
                    buf.read(bytes);
                    DataBufferUtils.release(buf);
                    return bytes;
                })
                .flatMap(excelLotImportService::buildPreview);
    }

    @PostMapping(path = "/lots-excel/commit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ImportResult> commit(@RequestBody ImportPreviewResponse preview,
                                     Authentication authentication) {
        String donorUserId = authentication.getName();
        return excelLotImportService.commitImport(preview, donorUserId);
    }
}
