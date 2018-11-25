package sk.mste.pdtproject.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import sk.mste.pdtproject.enumerator.QueryType;
import sk.mste.pdtproject.model.PDTFilter;
import sk.mste.pdtproject.util.QueryTemplates;

import java.sql.Array;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

// TODO: 11/23/2018 refactor this class
@Slf4j
@Component
public class DBAccessorImpl implements DBAccessor {
    private JdbcTemplate jdbcTemplate;

    @Autowired
    public DBAccessorImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public String queryData(PDTFilter PDTFilter, QueryType queryType) {
        String geoJSON = jdbcTemplate.query(
                QueryTemplates.QUERY_STUDY,

                // set parameters to prepared statements
                new PreparedStatementSetter() {
                    @Override
                    public void setValues(PreparedStatement preparedStatement) throws SQLException {
                        Array amenities = preparedStatement.getConnection().createArrayOf("VARCHAR", PDTFilter.getAmenityTypes());

                        preparedStatement.setDouble(1, PDTFilter.getLon());
                        preparedStatement.setDouble(2, PDTFilter.getLat());

                        preparedStatement.setArray( 3, amenities);

                        preparedStatement.setDouble(4, PDTFilter.getLon());
                        preparedStatement.setDouble(5, PDTFilter.getLat());

                        preparedStatement.setInt(6, PDTFilter.getMaxRadius());
                        preparedStatement.setInt(7, PDTFilter.getMaxResults());
                    }
                },

                // transform result set into our data type of geo data
                new ResultSetExtractor<String>() {
                    @Override
                    public String extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                        StringBuilder geoJSON = new StringBuilder();

                        geoJSON.append("[");
                        while (resultSet.next()) {

                            if (resultSet.getString(1) == null)
                                continue;

                            geoJSON.append("{")
                            .append("\"type\": \"Feature\", ")
                            .append("\"geometry\": ").append(resultSet.getString(3)).append(", ")
                            .append("\"properties\": {")
                                    .append("\"title\": \"").append(resultSet.getString(1)).append("\", ")
                                    .append("\"icon\": \"harbor\"}},");


                            resultSet.getString(2);
                            resultSet.getString(4);
                        }
                        log.info("ge {}", geoJSON.length());
                        if (geoJSON.length() > 1)
                            geoJSON.deleteCharAt(geoJSON.length()-1);
                        geoJSON.append("]");
                        log.info("GeoJSON contents >>>> \n{}\n", geoJSON.toString());
                        return geoJSON.toString();
                    }
                });


        return geoJSON;
    }


    @Override
    public String queryData(QueryType queryType) {
        String geoJSON = jdbcTemplate.query(
                QueryTemplates.QUERY_PARKSHEATMAP,
                // transform result set into our data type of geo data
                new ResultSetExtractor<String>() {
                    @Override
                    public String extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                        StringBuilder geoJSON = new StringBuilder();

                        geoJSON.append("[");
                        while (resultSet.next()) {

                            if (resultSet.getString(1) == null)
                                continue;

                            geoJSON.append("{")
                                    .append("\"type\": \"Feature\", ")
                                    .append("\"geometry\": ").append(resultSet.getString(1)).append(", ")
                                    .append("\"properties\": {")
                                    .append("\"title\": \"").append("Fire").append("\", ")
                                    .append("\"icon\": \"harbor\"}},");
                        }
                        log.info("ge {}", geoJSON.length());
                        if (geoJSON.length() > 1)
                            geoJSON.deleteCharAt(geoJSON.length()-1);
                        geoJSON.append("]");
                        log.info("GeoJSON contents >>>> \n{}\n", geoJSON.toString());
                        return geoJSON.toString();
                    }
                });


        return geoJSON;
    }
}
