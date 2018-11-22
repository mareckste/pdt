package sk.mste.pdtproject.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import sk.mste.pdtproject.model.PDTFilter;
import sk.mste.pdtproject.service.PDTService;
import sk.mste.pdtproject.util.Mappings;

@Slf4j
@RestController
public class PDTController {

    @Autowired
    PDTService pdtService;

    @PostMapping(Mappings.SEARCH)
    public ResponseEntity<Object> searchAmenities(@RequestBody PDTFilter filter) {
        log.info(filter.toString());
        String geoData = pdtService.findAmenities(filter);

        return new ResponseEntity<Object>(geoData, HttpStatus.OK);
    }
}
