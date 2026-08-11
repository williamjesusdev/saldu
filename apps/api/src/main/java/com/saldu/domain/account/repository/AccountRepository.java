package com.saldu.domain.account.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saldu.domain.account.model.Account;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByIdAndDeletedAtIsNull(UUID id);

    List<Account> findAllByDeletedAtIsNull();
}
