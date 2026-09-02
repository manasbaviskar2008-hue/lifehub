
package com.example.demo.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Note;
import com.example.demo.service.NoteService;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteController {
    private final NoteService service;
    public NoteController(NoteService service) { this.service = service; }

    @PostMapping
    public Note addNote(@RequestHeader("X-User-Email") String userEmail,
                        @RequestBody Note note) { return service.addNote(note, userEmail); }
    @GetMapping
    public List<Note> getNotes(@RequestHeader("X-User-Email") String userEmail) { return service.getNotes(userEmail); }
    @GetMapping("/{id}")
    public Note getNoteById(@PathVariable Long id,
                            @RequestHeader("X-User-Email") String userEmail) { return service.getNoteById(id, userEmail); }
    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id,
                           @RequestHeader("X-User-Email") String userEmail,
                           @RequestBody Note note) { return service.updateNote(id, note, userEmail); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id,
                                           @RequestHeader("X-User-Email") String userEmail) {
        service.deleteNote(id, userEmail); return ResponseEntity.noContent().build();
    }
}
