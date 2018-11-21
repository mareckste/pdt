package sk.mste.pdtproject.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import sk.mste.pdtproject.enumerator.QueryType;
import sk.mste.pdtproject.model.GeoData;
import sk.mste.pdtproject.model.GeoParams;
import sk.mste.pdtproject.util.QueryTemplates;

import java.sql.Array;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class DBAccessorImpl implements DBAccessor {
    private JdbcTemplate jdbcTemplate;

    @Autowired
    public DBAccessorImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<GeoData> queryData(GeoParams geoParams, QueryType queryType) {
        List<GeoData> geoDataList = jdbcTemplate.query(
                QueryTemplates.QUERY_STUDY,

                // set parameters to prepared statements
                new PreparedStatementSetter() {
                    @Override
                    public void setValues(PreparedStatement preparedStatement) throws SQLException {
                        Array amenities = preparedStatement.getConnection().createArrayOf("VARCHAR", geoParams.getAmenityTypes());

                        preparedStatement.setDouble(1, geoParams.getLon());
                        preparedStatement.setDouble(2, geoParams.getLat());

                        preparedStatement.setArray( 3, amenities);

                        preparedStatement.setDouble(4, geoParams.getLon());
                        preparedStatement.setDouble(5, geoParams.getLat());

                        preparedStatement.setInt(6, geoParams.getMaxRadius());
                        preparedStatement.setInt(7, geoParams.getMaxResults());
                    }
                },

                // transform result set into our data type of geo data
                new ResultSetExtractor<List<GeoData>>() {
                    @Override
                    public List<GeoData> extractData(ResultSet resultSet) throws SQLException, DataAccessException {
                        List<GeoData> result = new ArrayList<>();
                        while (resultSet.next()) {
                            GeoData geoData = new GeoData();
                            geoData.setName(resultSet.getString(1));
                            geoData.setAmenity(resultSet.getString(2));
                            geoData.setGeoJSON(resultSet.getObject(3));
                            geoData.setDistance(resultSet.getInt(4));

                            result.add(geoData);
                        }

                        return result;
                    }
                });

        log.info("List size = {}", geoDataList.size());
        return geoDataList;
    }
}
