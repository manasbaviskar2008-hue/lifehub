
package com.example.demo.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.entity.Note;
import com.example.demo.repository.NoteRepository;

@Service
public class NoteService {
    private final NoteRepository repository;
    private final UserOwnershipService ownershipService;

    public NoteService(NoteRepository repository, UserOwnershipService ownershipService) {
        this.repository = repository;
        this.ownershipService = ownershipService;
    }

    public Note addNote(Note note, String userEmail) {
        note.setUser(ownershipService.requireUser(userEmail));
        return repository.save(note);
    }

    public List<Note> getNotes(String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByUser_Id(userId);
    }

    public Note getNoteById(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        return repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found"));
    }

    public Note updateNote(Long id, Note incoming, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Note existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        existing.setTitle(incoming.getTitle());
        existing.setContent(incoming.getContent());
        existing.setCategory(incoming.getCategory());
        return repository.save(existing);
    }

    public void deleteNote(Long id, String userEmail) {
        Long userId = ownershipService.requireUser(userEmail).getId();
        Note existing = repository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
        repository.delete(existing);
    }
}
