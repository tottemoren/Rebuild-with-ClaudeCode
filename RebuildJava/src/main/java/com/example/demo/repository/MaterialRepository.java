package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Material;

@Repository
public interface MaterialRepository
        extends JpaRepository<Material, Long> {

    List<Material> findByFolderId(Long folderId);

    void deleteByFolderId(Long folderId);

}
