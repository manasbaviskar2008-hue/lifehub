package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Note;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUser_Id(Long userId);

    Optional<Note> findByIdAndUser_Id(Long id, Long userId);
}