package com.aerolinea.service;

import com.aerolinea.dto.RecommendationWithFlightsDTO;
import com.aerolinea.entity.Recommendation;
import com.aerolinea.repository.RecommendationRepository;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.aerolinea.dto.FlightDTO;
import com.aerolinea.entity.Flight;
import org.springframework.transaction.annotation.Transactional;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;


@Service
public class RecommendationService {

    private static final String IMAGE_UPLOAD_PATH = "uploads/recommendations";

    @Autowired
    private RecommendationRepository recommendationRepository;

    /* -------------------- Helper: guardar imagen redimensionada -------------------- */
    private String saveResized(MultipartFile file, String uploadDir,
                               String prefix, int maxW, int maxH, float quality) throws IOException {
        if (file == null || file.isEmpty()) throw new IOException("Archivo vacío");
        String original = Optional.ofNullable(file.getOriginalFilename()).orElse("img.jpg");
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1) : "jpg";
        String name = prefix + "_" + UUID.randomUUID() + "." + ext.toLowerCase(Locale.ROOT);
        File dest = new File(uploadDir, name);

        try (InputStream in = file.getInputStream()) {
            BufferedImage img = ImageIO.read(in);
            if (img == null) throw new IOException("Archivo no es imagen");
            Thumbnails.of(img)
                    .size(maxW, maxH)
                    .outputQuality(quality)
                    .toFile(dest);
        }
        return name;
    }

    /* -------------------- Crear recomendación (card + principal) -------------------- */
    public Recommendation saveRecommendation(Recommendation recommendation, MultipartFile mainImage) throws IOException {
        recommendation.setId(null);

        String uploadDir = System.getProperty("user.dir") + "/" + IMAGE_UPLOAD_PATH;
        File directory = new File(uploadDir);
        if (!directory.exists()) directory.mkdirs();

        if (mainImage != null && !mainImage.isEmpty()) {
            String cardThumb = saveResized(mainImage, uploadDir, "card", 600, 400, 0.8f);     // miniatura
            String mainLarge = saveResized(mainImage, uploadDir, "main", 1600, 1600, 0.85f);  // grande
            recommendation.setImageUrl(cardThumb);
            recommendation.setMainImage(mainLarge);
        }
        return recommendationRepository.save(recommendation);
    }

    /* -------------------- Guardar detalles (edición parcial) -------------------- */
    public void saveRecommendationDetails(
            Long id,
            String longDescription,
            String shortDescription,
            String flightType,
            MultipartFile mainImage,
            MultipartFile image1,
            MultipartFile image2,
            MultipartFile image3,
            MultipartFile image4
    ) throws IOException {
        Recommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recomendación no encontrada"));

        String uploadDir = System.getProperty("user.dir") + "/" + IMAGE_UPLOAD_PATH;
        File directory = new File(uploadDir);
        if (!directory.exists()) directory.mkdirs();

        // Guardar textos si vienen cargados
        if (longDescription != null) rec.setLongDescription(longDescription);
        if (shortDescription != null) rec.setDescription(shortDescription); // este es el campo que ya usás en la card
        if (flightType != null) rec.setFlightType(flightType);              // nuevo campo tipo de vuelo

        // Guardar imágenes si vienen cargadas
        if (mainImage != null && !mainImage.isEmpty()) {
            rec.setMainImage(saveResized(mainImage, uploadDir, "main", 1600, 1600, 0.85f));
        }
        if (image1 != null && !image1.isEmpty()) {
            rec.setImage1(saveResized(image1, uploadDir, "img1", 1200, 1200, 0.85f));
        }
        if (image2 != null && !image2.isEmpty()) {
            rec.setImage2(saveResized(image2, uploadDir, "img2", 1200, 1200, 0.85f));
        }
        if (image3 != null && !image3.isEmpty()) {
            rec.setImage3(saveResized(image3, uploadDir, "img3", 1200, 1200, 0.85f));
        }
        if (image4 != null && !image4.isEmpty()) {
            rec.setImage4(saveResized(image4, uploadDir, "img4", 1200, 1200, 0.85f));
        }

        recommendationRepository.save(rec);
    }


    /* -------------------- Eliminar recomendación -------------------- */
    public void deleteById(Long id) {
        Recommendation rec = recommendationRepository.findById(id).orElse(null);
        if (rec != null && rec.getImageUrl() != null) {
            Path imagePath = Paths.get(System.getProperty("user.dir"), IMAGE_UPLOAD_PATH, rec.getImageUrl());
            File imageFile = imagePath.toFile();
            if (imageFile.exists()) imageFile.delete();
        }
        recommendationRepository.deleteById(id);
    }

    /* -------------------- Eliminar detalles -------------------- */
    public void deleteDetailsById(Long id) {
        Recommendation rec = recommendationRepository.findById(id).orElse(null);
        if (rec != null) {
            String basePath = System.getProperty("user.dir") + "/" + IMAGE_UPLOAD_PATH + "/";
            deleteImageFile(basePath, rec.getMainImage());
            deleteImageFile(basePath, rec.getImage1());
            deleteImageFile(basePath, rec.getImage2());
            deleteImageFile(basePath, rec.getImage3());
            deleteImageFile(basePath, rec.getImage4());

            rec.setLongDescription(null);
            rec.setMainImage(null);
            rec.setImage1(null);
            rec.setImage2(null);
            rec.setImage3(null);
            rec.setImage4(null);
            recommendationRepository.save(rec);
        }
    }

    private void deleteImageFile(String basePath, String filename) {
        if (filename != null) {
            File file = new File(basePath + filename);
            if (file.exists()) file.delete();
        }
    }

    /* -------------------- Editar (datos de la card + miniatura opcional) -------------------- */
    public Recommendation updateRecommendation(Long id, Recommendation updatedData, MultipartFile newImage) {
        Recommendation existing = recommendationRepository.findById(id).orElse(null);
        if (existing == null) return null;


        if (notBlank(updatedData.getTitle()))           existing.setTitle(updatedData.getTitle());
        if (notBlank(updatedData.getDescription()))     existing.setDescription(updatedData.getDescription());
        if (notBlank(updatedData.getOrigin()))          existing.setOrigin(updatedData.getOrigin());
        if (notBlank(updatedData.getDestination()))     existing.setDestination(updatedData.getDestination());
        if (notBlank(updatedData.getDepartureDate()))   existing.setDepartureDate(updatedData.getDepartureDate());
        if (notBlank(updatedData.getReturnDate()))      existing.setReturnDate(updatedData.getReturnDate());
        if (updatedData.getPrice() != null)             existing.setPrice(updatedData.getPrice());
        if (notBlank(updatedData.getLongDescription())) existing.setLongDescription(updatedData.getLongDescription());
        if (notBlank(updatedData.getAirport()))               existing.setAirport(updatedData.getAirport());
        if (updatedData.getDiscountPercent() != null)         existing.setDiscountPercent(updatedData.getDiscountPercent());
        if (notBlank(updatedData.getShortDescription())) existing.setShortDescription(updatedData.getShortDescription());
        if (notBlank(updatedData.getFlightType()))       existing.setFlightType(updatedData.getFlightType());


        //  Miniatura de la card (opcional)
        if (newImage != null && !newImage.isEmpty()) {
            // borrar thumb anterior si existe
            if (existing.getImageUrl() != null) {
                Path oldImagePath = Paths.get(System.getProperty("user.dir"), IMAGE_UPLOAD_PATH, existing.getImageUrl());
                File oldFile = oldImagePath.toFile();
                if (oldFile.exists()) oldFile.delete();
            }
            try {
                String uploadDir = System.getProperty("user.dir") + "/" + IMAGE_UPLOAD_PATH;
                File directory = new File(uploadDir);
                if (!directory.exists()) directory.mkdirs();

                String newThumb = saveResized(newImage, uploadDir, "card", 600, 400, 0.8f);
                existing.setImageUrl(newThumb);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return recommendationRepository.save(existing);
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }


    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAll();
    }

    public Recommendation findById(Long id) {
        return recommendationRepository.findById(id).orElse(null);
    }

    public List<Recommendation> getRandomRecommendations(int count) {
        List<Recommendation> all = new ArrayList<>(recommendationRepository.findAll());
        if (all.isEmpty()) return Collections.emptyList();
        Collections.shuffle(all);
        int toIndex = Math.min(count, all.size());
        return new ArrayList<>(all.subList(0, toIndex));
    }



    private void resizeInPlace(File file, int maxW, int maxH, float quality) throws IOException {
        if (file == null || !file.exists() || !file.isFile()) return;
        BufferedImage img = javax.imageio.ImageIO.read(file);
        if (img == null) return;
        int w = img.getWidth(), h = img.getHeight();
        if (w <= maxW && h <= maxH) return;

        File tmp = new File(file.getParentFile(), file.getName() + ".tmp");
        net.coobird.thumbnailator.Thumbnails.of(img)
                .size(maxW, maxH)
                .outputQuality(quality)
                .toFile(tmp);

        if (!file.delete()) throw new IOException("No se pudo reemplazar " + file.getName());
        if (!tmp.renameTo(file)) throw new IOException("No se pudo renombrar temporal " + tmp.getName());
    }

    public int normalizeAllImages() {
        String base = System.getProperty("user.dir") + "/" + IMAGE_UPLOAD_PATH + "/";
        int processed = 0;
        for (Recommendation rec : recommendationRepository.findAll()) {
            try {
                if (rec.getImageUrl() != null) {
                    resizeInPlace(new File(base + rec.getImageUrl()), 600, 400, 0.8f);   // CARD
                    processed++;
                }
                if (rec.getMainImage() != null) {
                    resizeInPlace(new File(base + rec.getMainImage()), 1600, 1600, 0.85f);
                    processed++;
                }
                if (rec.getImage1() != null) {
                    resizeInPlace(new File(base + rec.getImage1()), 1200, 1200, 0.85f);
                    processed++;
                }
                if (rec.getImage2() != null) {
                    resizeInPlace(new File(base + rec.getImage2()), 1200, 1200, 0.85f);
                    processed++;
                }
                if (rec.getImage3() != null) {
                    resizeInPlace(new File(base + rec.getImage3()), 1200, 1200, 0.85f);
                    processed++;
                }
                if (rec.getImage4() != null) {
                    resizeInPlace(new File(base + rec.getImage4()), 1200, 1200, 0.85f);
                    processed++;
                }
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
        return processed;
    }


    private String makeThumbFromPath(File src, String uploadDir, int maxW, int maxH, float q) throws IOException {
        String name = "card_" + UUID.randomUUID() + ".jpg";
        File dest = new File(uploadDir, name);
        Thumbnails.of(src)
                .size(maxW, maxH)
                .outputQuality(q)
                .toFile(dest);
        return name;
    }

    public int backfillCardThumbnails() {
        String base = System.getProperty("user.dir") + "/" + IMAGE_UPLOAD_PATH + "/";
        int updated = 0;
        for (Recommendation rec : recommendationRepository.findAll()) {
            try {
                boolean needsThumb = (rec.getImageUrl() == null || rec.getImageUrl().isBlank());
                if (needsThumb && rec.getMainImage() != null && !rec.getMainImage().isBlank()) {
                    File src = new File(base + rec.getMainImage());
                    if (src.exists()) {
                        String thumb = makeThumbFromPath(src, base, 600, 400, 0.8f);
                        rec.setImageUrl(thumb);
                        recommendationRepository.save(rec);
                        updated++;
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return updated;
    }

    @Transactional(readOnly = true)
    public RecommendationWithFlightsDTO findByIdWithFlightsDTO(Long id) {

        var rec = recommendationRepository.findWithFlightsById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recomendación no encontrada: " + id));

        RecommendationWithFlightsDTO dto = new RecommendationWithFlightsDTO();
        dto.setId(rec.getId());
        dto.setTitle(rec.getTitle());
        dto.setDescription(rec.getDescription());
        dto.setOrigin(rec.getOrigin());
        dto.setDestination(rec.getDestination());
        dto.setDepartureDate(rec.getDepartureDate());
        dto.setReturnDate(rec.getReturnDate());
        dto.setPrice(rec.getPrice());
        dto.setImageUrl(rec.getImageUrl());

        dto.setLongDescription(rec.getLongDescription());
        dto.setMainImage(rec.getMainImage());
        dto.setImage1(rec.getImage1());
        dto.setImage2(rec.getImage2());
        dto.setImage3(rec.getImage3());
        dto.setImage4(rec.getImage4());

        // mapear vuelos a DTO
        List<FlightDTO> flights = rec.getFlights() == null ? List.of()
                : rec.getFlights().stream().map(this::toFlightDTO).toList();
        dto.setFlights(flights);

        return dto;
    }

    private FlightDTO toFlightDTO(Flight f) {
        FlightDTO d = new FlightDTO();
        d.setId(f.getId());
        d.setFlightNumber(f.getFlightNumber());
        d.setOrigin(f.getOrigin());
        d.setDestination(f.getDestination());
        d.setDepartureDate(f.getDepartureDate());
        d.setDepartureTime(f.getDepartureTime());
        d.setArrivalDate(f.getArrivalDate());
        d.setArrivalTime(f.getArrivalTime());
        d.setPrice(f.getPrice());
        d.setSeatsAvailable(f.getSeatsAvailable());
        d.setAirline(f.getAirline());
        d.setAircraftType(f.getAircraftType());
        d.setFlightStatus(f.getFlightStatus());
        return d;
    }
    public Map<String, Integer> autofixOriginDestinationFromTitle() {
        int updated = 0, skipped = 0;
        for (Recommendation r : recommendationRepository.findAll()) {
            boolean changed = false;

            String[] infer = inferFromTitle(r.getTitle()); // [0]=origen, [1]=destino

            if ((r.getOrigin() == null || r.getOrigin().isBlank()) && infer[0] != null) {
                r.setOrigin(normalizeCity(infer[0]));
                changed = true;
            }
            if ((r.getDestination() == null || r.getDestination().isBlank()) && infer[1] != null) {
                r.setDestination(normalizeCity(infer[1]));
                changed = true;
            }

            if (changed) {
                recommendationRepository.save(r);
                updated++;
            } else {
                skipped++;
            }
        }
        return Map.of("updated", updated, "skipped", skipped);
    }

    private String[] inferFromTitle(String title) {
        if (title == null) return new String[]{null, null};
        var m = java.util.regex.Pattern
                .compile("^\\s*([A-Za-zÁÉÍÓÚÑñ]+(?:\\s+[A-Za-zÁÉÍÓÚÑñ]+)*)\\s*[-–—]\\s*([A-Za-zÁÉÍÓÚÑñ]+(?:\\s+[A-Za-zÁÉÍÓÚÑñ]+)*)")
                .matcher(title);
        if (!m.find()) return new String[]{null, null};
        return new String[]{ m.group(1), m.group(2) };
    }

    private String normalizeCity(String s) {
        if (s == null) return null;
        s = s.replaceAll("\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}", "");         // fechas
        s = s.replaceAll("\\bAR\\s*\\$\\s*\\d+[\\.,\\d]*", "");            // precios
        s = s.replaceAll("[-–—]", " ").replaceAll("\\s{2,}", " ").trim(); // guiones/espacios
        return s;
    }


}